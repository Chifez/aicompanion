package contracts

import (
	"net/http"
	"time"

	"github.com/aicomp/ai-virtual-chat/backend/internal/config"
	"github.com/aicomp/ai-virtual-chat/backend/internal/services"
)

// Logger interface defines logging methods
type Logger interface {
	Println(v ...any)
	Printf(format string, v ...any)
}

// V1APIInterface defines the interface that v1 API handlers need from the parent API
// This is in a separate package to avoid circular imports between httpapi and v1 packages
type V1APIInterface interface {
	Service() *services.AppService
	Logger() Logger
	Cfg() *config.Config
	RespondJSON(w http.ResponseWriter, status int, payload any)
	RespondError(w http.ResponseWriter, status int, msg string)
	EnsureService(w http.ResponseWriter) bool
	RespondServiceError(w http.ResponseWriter, err error)
	AuthMiddleware(next http.Handler) http.Handler
	SignAccessToken(userID, sessionID string) (string, time.Time, error)
	SetAccessTokenCookie(w http.ResponseWriter, token string)
	SetRefreshTokenCookie(w http.ResponseWriter, token string, expiresAt time.Time)
	ClearAuthCookies(w http.ResponseWriter)
}

