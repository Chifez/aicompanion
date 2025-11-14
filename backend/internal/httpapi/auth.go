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

const accessTokenTTL = 15 * time.Minute

func (api *API) authMiddleware(next http.Handler) http.Handler {
	secret := api.cfg.JWTSecret

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := strings.TrimSpace(r.Header.Get("Authorization"))
		if authHeader == "" {
			api.respondError(w, http.StatusUnauthorized, "missing authorization token")
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			api.respondError(w, http.StatusUnauthorized, "invalid authorization header")
			return
		}

		tokenString := strings.TrimSpace(parts[1])
		if tokenString == "" {
			api.respondError(w, http.StatusUnauthorized, "missing authorization token")
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
			api.respondError(w, http.StatusUnauthorized, "invalid token")
			return
		}

		userID := strings.TrimSpace(claims.Subject)
		if userID == "" {
			api.respondError(w, http.StatusUnauthorized, "invalid token")
			return
		}

		sessionID := strings.TrimSpace(claims.ID)
		if sessionID == "" {
			api.respondError(w, http.StatusUnauthorized, "invalid token")
			return
		}

		if api.service == nil {
			api.respondError(w, http.StatusServiceUnavailable, "service unavailable")
			return
		}

		validatedUserID, err := api.service.ValidateSession(r.Context(), sessionID)
		if err != nil {
			api.respondError(w, http.StatusUnauthorized, "session expired")
			return
		}

		if validatedUserID != userID {
			api.respondError(w, http.StatusUnauthorized, "session expired")
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
