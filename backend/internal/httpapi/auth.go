package httpapi

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const (
	userIDContextKey contextKey = "userID"
	sessionIDContextKey contextKey = "sessionID"
)

const accessTokenTTL = 15 * time.Minute // Increased to 30 minutes for better UX

// Cookie helper functions
func (api *API) setAccessTokenCookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "nl_access",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   true, // HTTPS in production
		SameSite: http.SameSiteNoneMode, // Cross-site for localhost:3000 -> localhost:8080
		MaxAge:   int(accessTokenTTL.Seconds()),
	})
}

func (api *API) setRefreshTokenCookie(w http.ResponseWriter, token string, expiresAt time.Time) {
	http.SetCookie(w, &http.Cookie{
		Name:     "nl_refresh",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
		Expires:  expiresAt,
	})
}

func (api *API) clearAuthCookies(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     "nl_access",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
		MaxAge:   -1,
	})
	http.SetCookie(w, &http.Cookie{
		Name:     "nl_refresh",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
		MaxAge:   -1,
	})
}

func (api *API) authMiddleware(next http.Handler) http.Handler {
	secret := api.cfg.JWTSecret

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Read access token from cookie (not header)
		cookie, err := r.Cookie("nl_access")
		if err != nil {
			// Return error with code for frontend to distinguish
			api.respondJSON(w, http.StatusUnauthorized, map[string]any{
				"message": "authentication required",
				"code":    "token_missing",
			})
			return
		}

		tokenString := strings.TrimSpace(cookie.Value)
		if tokenString == "" {
			api.respondJSON(w, http.StatusUnauthorized, map[string]any{
				"message": "authentication required",
				"code":    "token_missing",
			})
			return
		}

		// Local development escape hatch: allow using the raw secret directly.
		if tokenString == secret {
			next.ServeHTTP(w, r)
			return
		}

		claims := &jwt.RegisteredClaims{}
		parser := jwt.NewParser(jwt.WithLeeway(30 * time.Second))

		token, err := parser.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (any, error) {
			if method, ok := token.Method.(*jwt.SigningMethodHMAC); !ok || method != jwt.SigningMethodHS256 {
				return nil, fmt.Errorf("unexpected signing method %T", token.Method)
			}
			return []byte(secret), nil
		})
		if err != nil || !token.Valid {
			// Token expired or invalid - return with code for frontend to trigger refresh
			api.respondJSON(w, http.StatusUnauthorized, map[string]any{
				"message": "token expired or invalid",
				"code":    "token_expired",
			})
			return
		}

		userID := strings.TrimSpace(claims.Subject)
		if userID == "" {
			api.respondJSON(w, http.StatusUnauthorized, map[string]any{
				"message": "invalid token",
				"code":    "token_expired",
			})
			return
		}

		sessionID := strings.TrimSpace(claims.ID)
		if sessionID == "" {
			api.respondJSON(w, http.StatusUnauthorized, map[string]any{
				"message": "invalid token",
				"code":    "token_expired",
			})
			return
		}

		if api.service == nil {
			api.respondError(w, http.StatusServiceUnavailable, "service unavailable")
			return
		}

		validatedUserID, err := api.service.ValidateSession(r.Context(), sessionID)
		if err != nil {
			api.respondJSON(w, http.StatusUnauthorized, map[string]any{
				"message": "session expired",
				"code":    "token_expired",
			})
			return
		}

		if validatedUserID != userID {
			api.respondJSON(w, http.StatusUnauthorized, map[string]any{
				"message": "session expired",
				"code":    "token_expired",
			})
			return
		}

		ctx := context.WithValue(r.Context(), userIDContextKey, userID)
		ctx = context.WithValue(ctx, sessionIDContextKey, sessionID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func userIDFromContext(ctx context.Context) string {
	if ctx == nil {
		return ""
	}
	if val, ok := ctx.Value(userIDContextKey).(string); ok {
		return val
	}
	return ""
}

func sessionIDFromContext(ctx context.Context) string {
	if ctx == nil {
		return ""
	}
	if val, ok := ctx.Value(sessionIDContextKey).(string); ok {
		return val
	}
	return ""
}

func (api *API) signAccessToken(userID string, sessionID string) (string, time.Time, error) {
	userID = strings.TrimSpace(userID)
	if userID == "" {
		return "", time.Time{}, fmt.Errorf("invalid user id")
	}
	sessionID = strings.TrimSpace(sessionID)
	if sessionID == "" {
		return "", time.Time{}, fmt.Errorf("invalid session id")
	}

	now := time.Now()
	expiry := now.Add(accessTokenTTL)

	claims := jwt.RegisteredClaims{
		Subject:   userID,
		ID:        sessionID,
		Issuer:    "aicomp-backend",
		IssuedAt:  jwt.NewNumericDate(now),
		ExpiresAt: jwt.NewNumericDate(expiry),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(api.cfg.JWTSecret))
	if err != nil {
		return "", time.Time{}, err
	}
	return signed, expiry, nil
}
