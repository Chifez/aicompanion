package httpapi

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

// RateLimitConfig defines the rate limit configuration for an endpoint
type RateLimitConfig struct {
	Limit    int           // Number of requests allowed
	Window   time.Duration // Time window for the limit
	Strategy string        // "ip", "user", or "global"
}

// RateLimiter handles rate limiting using Redis
type RateLimiter struct {
	redis  *redis.Client
	logger Logger
	config map[string]RateLimitConfig
}

// NewRateLimiter creates a new rate limiter instance
func NewRateLimiter(redisClient *redis.Client, logger Logger) *RateLimiter {
	return &RateLimiter{
		redis:  redisClient,
		logger: logger,
		config: map[string]RateLimitConfig{
			// Auth endpoints - strict limits per IP
			"POST:/api/auth/register": {Limit: 5, Window: 1 * time.Hour, Strategy: "ip"},
			"POST:/api/auth/login":    {Limit: 10, Window: 15 * time.Minute, Strategy: "ip"},
			"POST:/api/auth/refresh":  {Limit: 30, Window: 1 * time.Minute, Strategy: "ip"},
			"POST:/api/auth/logout":   {Limit: 20, Window: 1 * time.Minute, Strategy: "user"},

			// Protected endpoints - per user
			"GET:/api/auth/session":       {Limit: 30, Window: 1 * time.Minute, Strategy: "user"},
			"GET:/api/dashboard/overview":  {Limit: 60, Window: 1 * time.Minute, Strategy: "user"},
			"GET:/api/meetings":            {Limit: 30, Window: 1 * time.Minute, Strategy: "user"},
			"GET:/api/meetings/{meetingID}": {Limit: 60, Window: 1 * time.Minute, Strategy: "user"},
			"POST:/api/meetings":          {Limit: 10, Window: 1 * time.Minute, Strategy: "user"},
			"PATCH:/api/meetings/{meetingID}": {Limit: 20, Window: 1 * time.Minute, Strategy: "user"},
			"DELETE:/api/meetings/{meetingID}": {Limit: 10, Window: 1 * time.Minute, Strategy: "user"},
			"POST:/api/meetings/{meetingID}/start": {Limit: 5, Window: 1 * time.Minute, Strategy: "user"},
			"POST:/api/meetings/{meetingID}/join": {Limit: 10, Window: 1 * time.Minute, Strategy: "user"},
			"GET:/api/history":            {Limit: 30, Window: 1 * time.Minute, Strategy: "user"},
			"GET:/api/history/{transcriptID}": {Limit: 60, Window: 1 * time.Minute, Strategy: "user"},
			"GET:/api/settings":           {Limit: 30, Window: 1 * time.Minute, Strategy: "user"},
			"PUT:/api/settings":           {Limit: 20, Window: 1 * time.Minute, Strategy: "user"},
			"GET:/api/settings/presets":   {Limit: 30, Window: 1 * time.Minute, Strategy: "user"},
			"POST:/api/settings/presets":  {Limit: 10, Window: 1 * time.Minute, Strategy: "user"},
			"PUT:/api/settings/presets/{presetID}": {Limit: 20, Window: 1 * time.Minute, Strategy: "user"},
			"DELETE:/api/settings/presets/{presetID}": {Limit: 10, Window: 1 * time.Minute, Strategy: "user"},
		},
	}
}

// Middleware returns a Chi middleware function for rate limiting
func (rl *RateLimiter) Middleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Build endpoint key (method + path)
			// Note: Chi route patterns like {meetingID} need to be normalized
			endpointKey := rl.normalizePath(r.Method, r.URL.Path)

			// Check if this endpoint has rate limiting configured
			config, exists := rl.config[endpointKey]
			if !exists {
				// No rate limit for this endpoint, proceed
				next.ServeHTTP(w, r)
				return
			}

			// Get identifier based on strategy
			var identifier string
			switch config.Strategy {
			case "ip":
				identifier = rl.getClientIP(r)
			case "user":
				// Try to get user ID from context (set by authMiddleware)
				identifier = userIDFromContext(r.Context())
				if identifier == "" {
					// Fallback to IP if not authenticated
					identifier = rl.getClientIP(r)
				}
			default:
				identifier = rl.getClientIP(r)
			}

			// Build Redis key
			key := fmt.Sprintf("ratelimit:%s:%s:%s", config.Strategy, identifier, endpointKey)

			// Check rate limit
			allowed, remaining, resetTime, err := rl.checkLimit(r.Context(), key, config)

			if err != nil {
				// On error, fail open (allow request) to avoid breaking the app
				rl.logger.Printf("rate limit error: %v", err)
				next.ServeHTTP(w, r)
				return
			}

			// Set rate limit headers (always set, even if not rate limited)
			w.Header().Set("X-RateLimit-Limit", strconv.Itoa(config.Limit))
			w.Header().Set("X-RateLimit-Remaining", strconv.Itoa(remaining))
			w.Header().Set("X-RateLimit-Reset", strconv.FormatInt(resetTime.Unix(), 10))

			if !allowed {
				// Rate limit exceeded
				w.Header().Set("Retry-After", strconv.FormatInt(int64(config.Window.Seconds()), 10))
				rl.respondError(w, http.StatusTooManyRequests, "rate limit exceeded")
				return
			}

			// Request allowed, proceed
			next.ServeHTTP(w, r)
		})
	}
}

// checkLimit uses Redis to implement a token bucket rate limiter
func (rl *RateLimiter) checkLimit(ctx context.Context, key string, config RateLimitConfig) (allowed bool, remaining int, resetTime time.Time, err error) {
	// Use Redis pipeline for atomic operations
	pipe := rl.redis.Pipeline()
	
	// Increment the counter
	incr := pipe.Incr(ctx, key)
	
	// Set expiration (only if key is new)
	pipe.Expire(ctx, key, config.Window)
	
	// Execute pipeline
	_, err = pipe.Exec(ctx)
	if err != nil {
		return true, config.Limit, time.Now(), err // Fail open
	}

	count := incr.Val()
	remaining = int(config.Limit) - int(count)
	if remaining < 0 {
		remaining = 0
	}

	allowed = count <= int64(config.Limit)

	// Calculate reset time
	ttl, _ := rl.redis.TTL(ctx, key).Result()
	if ttl > 0 {
		resetTime = time.Now().Add(ttl)
	} else {
		resetTime = time.Now().Add(config.Window)
	}

	return allowed, remaining, resetTime, nil
}

// getClientIP extracts the client IP from the request
// Handles proxies and load balancers
func (rl *RateLimiter) getClientIP(r *http.Request) string {
	// Check X-Forwarded-For header (from proxy/load balancer)
	// Note: In production, you should only trust this from your own proxy
	if ip := r.Header.Get("X-Forwarded-For"); ip != "" {
		// X-Forwarded-For can contain multiple IPs, take the first one
		ips := strings.Split(ip, ",")
		if len(ips) > 0 {
			return strings.TrimSpace(ips[0])
		}
	}

	// Check X-Real-IP header (alternative proxy header)
	if ip := r.Header.Get("X-Real-IP"); ip != "" {
		return strings.TrimSpace(ip)
	}

	// Fallback to RemoteAddr
	// Remove port if present (e.g., "192.168.1.1:12345" -> "192.168.1.1")
	addr := r.RemoteAddr
	if idx := strings.LastIndex(addr, ":"); idx != -1 {
		addr = addr[:idx]
	}
	return addr
}

// normalizePath converts Chi route patterns to a consistent format
// Example: "/api/meetings/abc123" -> "/api/meetings/{meetingID}"
func (rl *RateLimiter) normalizePath(method, path string) string {
	// For now, we'll use a simple approach: match exact paths or patterns
	// In a more sophisticated implementation, you'd match against Chi route patterns
	
	// Check for common patterns
	if strings.Contains(path, "/meetings/") && len(strings.Split(path, "/")) == 4 {
		// Matches /api/meetings/{id}
		return method + ":/api/meetings/{meetingID}"
	}
	if strings.Contains(path, "/history/") && len(strings.Split(path, "/")) == 4 {
		// Matches /api/history/{id}
		return method + ":/api/history/{transcriptID}"
	}
	if strings.Contains(path, "/presets/") && len(strings.Split(path, "/")) == 5 {
		// Matches /api/settings/presets/{id}
		return method + ":/api/settings/presets/{presetID}"
	}

	// Return method + path as-is for exact matches
	return method + ":" + path
}