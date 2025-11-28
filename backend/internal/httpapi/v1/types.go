package v1

import (
	"net/http"
	"time"

	"github.com/aicomp/ai-virtual-chat/backend/internal/config"
	"github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/contracts"
	"github.com/aicomp/ai-virtual-chat/backend/internal/services"
)

// API wraps the parent API interface for v1 handlers
type API struct {
	parent contracts.V1APIInterface
}

// NewAPI creates a new v1 API instance
func NewAPI(parent contracts.V1APIInterface) *API {
	return &API{parent: parent}
}

// Service returns the app service
func (api *API) Service() *services.AppService {
	return api.parent.Service()
}

// Logger returns the logger
func (api *API) Logger() contracts.Logger {
	return api.parent.Logger()
}

// Cfg returns the config
func (api *API) Cfg() *config.Config {
	return api.parent.Cfg()
}

// RespondJSON writes a JSON response
func (api *API) RespondJSON(w http.ResponseWriter, status int, payload any) {
	api.parent.RespondJSON(w, status, payload)
}

// RespondError writes an error response
func (api *API) RespondError(w http.ResponseWriter, status int, msg string) {
	api.parent.RespondError(w, status, msg)
}

// EnsureService checks if service is available
func (api *API) EnsureService(w http.ResponseWriter) bool {
	return api.parent.EnsureService(w)
}

// RespondServiceError handles service errors with appropriate status codes
func (api *API) RespondServiceError(w http.ResponseWriter, err error) {
	api.parent.RespondServiceError(w, err)
}

// AuthMiddleware returns the authentication middleware
func (api *API) AuthMiddleware(next http.Handler) http.Handler {
	return api.parent.AuthMiddleware(next)
}

// SignAccessToken signs a JWT access token
func (api *API) SignAccessToken(userID, sessionID string) (string, time.Time, error) {
	return api.parent.SignAccessToken(userID, sessionID)
}

// SetAccessTokenCookie sets the access token cookie
func (api *API) SetAccessTokenCookie(w http.ResponseWriter, token string) {
	api.parent.SetAccessTokenCookie(w, token)
}

// SetRefreshTokenCookie sets the refresh token cookie
func (api *API) SetRefreshTokenCookie(w http.ResponseWriter, token string, expiresAt time.Time) {
	api.parent.SetRefreshTokenCookie(w, token, expiresAt)
}

// ClearAuthCookies clears both access and refresh token cookies
func (api *API) ClearAuthCookies(w http.ResponseWriter) {
	api.parent.ClearAuthCookies(w)
}
