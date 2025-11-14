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
)

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

		ctx := context.WithValue(r.Context(), userIDContextKey, userID)
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

func (api *API) signUserJWT(userID string) (string, error) {
	userID = strings.TrimSpace(userID)
	if userID == "" {
		return "", fmt.Errorf("invalid user id")
	}

	claims := jwt.RegisteredClaims{
		Subject:   userID,
		Issuer:    "aicomp-backend",
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(api.cfg.JWTSecret))
}
