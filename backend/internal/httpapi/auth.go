package httpapi

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/context"
	"github.com/golang-jwt/jwt/v5"
)

const accessTokenTTL = 15 * time.Minute // Increased to 30 minutes for better UX

// Cookie helper functions
// SetAccessTokenCookie sets the access token cookie
func (api *API) SetAccessTokenCookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "nl_access",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,                  // HTTPS in production
		SameSite: http.SameSiteNoneMode, // Cross-site for localhost:3000 -> localhost:8080
		MaxAge:   int(accessTokenTTL.Seconds()),
	})
}

// SetRefreshTokenCookie sets the refresh token cookie
func (api *API) SetRefreshTokenCookie(w http.ResponseWriter, token string, expiresAt time.Time) {
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

// ClearAuthCookies clears both access and refresh token cookies
func (api *API) ClearAuthCookies(w http.ResponseWriter) {
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

// AuthMiddleware provides authentication middleware for protected routes
func (api *API) AuthMiddleware(next http.Handler) http.Handler {
	secret := api.cfg.JWTSecret

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Read access token from cookie (not header)
		cookie, err := r.Cookie("nl_access")
		if err != nil {
			// Return error with code for frontend to distinguish
			api.RespondJSON(w, http.StatusUnauthorized, map[string]any{
				"message": "authentication required",
				"code":    "token_missing",
			})
			return
		}

		tokenString := strings.TrimSpace(cookie.Value)
		if tokenString == "" {
			api.RespondJSON(w, http.StatusUnauthorized, map[string]any{
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
			api.RespondJSON(w, http.StatusUnauthorized, map[string]any{
				"message": "token expired or invalid",
				"code":    "token_expired",
			})
			return
		}

		userID := strings.TrimSpace(claims.Subject)
		if userID == "" {
			api.RespondJSON(w, http.StatusUnauthorized, map[string]any{
				"message": "invalid token",
				"code":    "token_expired",
			})
			return
		}

		sessionID := strings.TrimSpace(claims.ID)
		if sessionID == "" {
			api.RespondJSON(w, http.StatusUnauthorized, map[string]any{
				"message": "invalid token",
				"code":    "token_expired",
			})
			return
		}

		if api.service == nil {
			api.RespondError(w, http.StatusServiceUnavailable, "service unavailable")
			return
		}

		validatedUserID, err := api.service.ValidateSession(r.Context(), sessionID)
		if err != nil {
			api.RespondJSON(w, http.StatusUnauthorized, map[string]any{
				"message": "session expired",
				"code":    "token_expired",
			})
			return
		}

		if validatedUserID != userID {
			api.RespondJSON(w, http.StatusUnauthorized, map[string]any{
				"message": "session expired",
				"code":    "token_expired",
			})
			return
		}

		ctx := context.WithAuthContext(r.Context(), userID, sessionID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// SignAccessToken creates and signs a JWT access token
func (api *API) SignAccessToken(userID string, sessionID string) (string, time.Time, error) {
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
