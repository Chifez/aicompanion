package httpapi

import (
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	httpapicontext "github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/context"
	"github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/contracts"
	"golang.org/x/time/rate"
)

// RateLimitConfig defines the rate limit configuration for an endpoint
type RateLimitConfig struct {
	Limit    int           // Number of requests allowed
	Window   time.Duration // Time window for the limit
	Burst    int
	Strategy string // "ip", "user", or "global"
}

//limiter entry holds a rate limiter instance

type LimiterEntry struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

// RateLimiter handles rate limiting using Redis
type RateLimiter struct {
	logger contracts.Logger
	config map[string]RateLimitConfig

	limiters map[string]*LimiterEntry
	mu       sync.RWMutex

	cleanupTicker *time.Ticker
	done          chan struct{}
}

// NewRateLimiter creates a new rate limiter instance
func NewRateLimiter(logger contracts.Logger) *RateLimiter {
	rl := &RateLimiter{
		logger:   logger,
		limiters: make(map[string]*LimiterEntry),
		config: map[string]RateLimitConfig{
			"POST:/api/v1/auth/register": {
				Limit: 5, Window: 1 * time.Hour, Burst: 2, Strategy: "ip",
			},
			"POST:/api/v1/auth/login": {
				Limit: 10, Window: 15 * time.Minute, Burst: 3, Strategy: "ip",
			},
			"POST:/api/v1/auth/refresh": {
				Limit: 30, Window: 1 * time.Minute, Burst: 10, Strategy: "ip",
			},
			"POST:/api/v1/auth/logout": {
				Limit: 20, Window: 1 * time.Minute, Burst: 5, Strategy: "user",
			},

			"GET:/api/v1/auth/session": {
				Limit: 30, Window: 1 * time.Minute, Burst: 10, Strategy: "user",
			},
			"GET:/api/v1/dashboard/overview": {
				Limit: 60, Window: 1 * time.Minute, Burst: 20, Strategy: "user",
			},
			"GET:/api/v1/meetings": {
				Limit: 30, Window: 1 * time.Minute, Burst: 10, Strategy: "user",
			},
			"GET:/api/v1/meetings/{meetingID}": {
				Limit: 60, Window: 1 * time.Minute, Burst: 15, Strategy: "user",
			},
			"POST:/api/v1/meetings": {
				Limit: 10, Window: 1 * time.Minute, Burst: 3, Strategy: "user",
			},
			"PATCH:/api/v1/meetings/{meetingID}": {
				Limit: 20, Window: 1 * time.Minute, Burst: 5, Strategy: "user",
			},
			"DELETE:/api/v1/meetings/{meetingID}": {
				Limit: 10, Window: 1 * time.Minute, Burst: 3, Strategy: "user",
			},
			"POST:/api/v1/meetings/{meetingID}/start": {
				Limit: 5, Window: 1 * time.Minute, Burst: 2, Strategy: "user",
			},
			"POST:/api/v1/meetings/{meetingID}/join": {
				Limit: 10, Window: 1 * time.Minute, Burst: 3, Strategy: "user",
			},
			"GET:/api/v1/history": {
				Limit: 30, Window: 1 * time.Minute, Burst: 10, Strategy: "user",
			},
			"GET:/api/v1/history/{transcriptID}": {
				Limit: 60, Window: 1 * time.Minute, Burst: 15, Strategy: "user",
			},
			"GET:/api/v1/settings": {
				Limit: 30, Window: 1 * time.Minute, Burst: 10, Strategy: "user",
			},
			"PUT:/api/v1/settings": {
				Limit: 20, Window: 1 * time.Minute, Burst: 5, Strategy: "user",
			},
			"GET:/api/v1/settings/presets": {
				Limit: 30, Window: 1 * time.Minute, Burst: 10, Strategy: "user",
			},
			"POST:/api/v1/settings/presets": {
				Limit: 10, Window: 1 * time.Minute, Burst: 3, Strategy: "user",
			},
			"PUT:/api/v1/settings/presets/{presetID}": {
				Limit: 20, Window: 1 * time.Minute, Burst: 5, Strategy: "user",
			},
			"DELETE:/api/v1/settings/presets/{presetID}": {
				Limit: 10, Window: 1 * time.Minute, Burst: 3, Strategy: "user",
			},
		},
		done: make(chan struct{}),
	}

	rl.cleanupTicker = time.NewTicker(5 * time.Minute)
	go rl.cleanup()

	return rl
}

// cleanup handles the cleanup of the function
// i am just trying to test this go doc thingy
func (rl *RateLimiter) cleanup() {
	for {
		select {
		case <-rl.cleanupTicker.C:
			rl.mu.Lock()
			now := time.Now()
			for key, entry := range rl.limiters {
				if now.Sub(entry.lastSeen) > time.Hour {
					delete(rl.limiters, key)
				}
			}
			rl.mu.Unlock()
		case <-rl.done:
			return
		}
	}
}

func (rl *RateLimiter) Stop() {
	rl.cleanupTicker.Stop()
	close(rl.done)
}

func (rl *RateLimiter) getLimiter(identifier string, config RateLimitConfig) *rate.Limiter {
	rl.mu.RLock()
	entry, exists := rl.limiters[identifier]
	rl.mu.RUnlock()

	if exists {
		entry.lastSeen = time.Now()
		return entry.limiter
	}

	ratePerSecond := float64(config.Limit) / config.Window.Seconds()
	limiter := rate.NewLimiter(rate.Limit(ratePerSecond), config.Burst)

	rl.mu.Lock()
	rl.limiters[identifier] = &LimiterEntry{
		limiter:  limiter,
		lastSeen: time.Now(),
	}

	rl.mu.Unlock()

	return limiter
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
				identifier = httpapicontext.UserIDFromContext(r.Context())
				if identifier == "" {
					// Fallback to IP if not authenticated
					identifier = rl.getClientIP(r)
				}
			default:
				identifier = rl.getClientIP(r)
			}

			// Build Redis key
			limiterkey := endpointKey + ":" + identifier

			// Check rate limit
			limiter := rl.getLimiter(limiterkey, config)

			if !limiter.Allow() {
				w.Header().Set("Retry-After", strconv.FormatInt(int64(config.Window.Seconds()), 10))
				w.Header().Set("X-RateLimit-Limit", strconv.Itoa(config.Limit))
				w.Header().Set("X-RateLimit-Remaining", "0")
				w.Header().Set("X-RateLimit-Reset", strconv.FormatInt(time.Now().Add(config.Window).Unix(), 10))

				w.WriteHeader(http.StatusTooManyRequests)
				w.Write([]byte(`{"message":"rate limit exceeded"}`))
				return
			}

			reserve := limiter.Reserve()

			if !reserve.OK() {
				w.WriteHeader(http.StatusTooManyRequests)
				return
			}

			delay := reserve.Delay()
			reserve.Cancel()

			remaining := config.Limit

			if delay > 0 {

				remaining = int(float64(config.Limit) * (1 - delay.Seconds()/config.Window.Seconds()))

				if remaining < 0 {
					remaining = 0
				}
			}

			// Set rate limit headers (always set, even if not rate limited)
			w.Header().Set("X-RateLimit-Limit", strconv.Itoa(config.Limit))
			w.Header().Set("X-RateLimit-Remaining", strconv.Itoa(remaining))
			w.Header().Set("X-RateLimit-Reset", strconv.FormatInt(time.Now().Add(config.Window).Unix(), 10))

			// Request allowed, proceed
			next.ServeHTTP(w, r)
		})
	}
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
// Example: "/api/v1/meetings/abc123" -> "/api/v1/meetings/{meetingID}"
func (rl *RateLimiter) normalizePath(method, path string) string {
	// For now, we'll use a simple approach: match exact paths or patterns
	// In a more sophisticated implementation, you'd match against Chi route patterns

	// Check for common patterns
	if strings.Contains(path, "/meetings/") && len(strings.Split(path, "/")) == 5 {
		// Matches /api/v1/meetings/{id}
		return method + ":/api/v1/meetings/{meetingID}"
	}
	if strings.Contains(path, "/history/") && len(strings.Split(path, "/")) == 5 {
		// Matches /api/v1/history/{id}
		return method + ":/api/v1/history/{transcriptID}"
	}
	if strings.Contains(path, "/presets/") && len(strings.Split(path, "/")) == 6 {
		// Matches /api/v1/settings/presets/{id}
		return method + ":/api/v1/settings/presets/{presetID}"
	}

	// Return method + path as-is for exact matches
	return method + ":" + path
}
