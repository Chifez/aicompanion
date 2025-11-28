package handlers

import (
	"net/http"
	"strings"

	"github.com/aicomp/ai-virtual-chat/backend/internal/core"
	httpapicontext "github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/context"
	"github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/contracts"
	"github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/response"
	"github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/utils"
)

// HandleLogin handles POST /api/v1/auth/login
func HandleLogin(api contracts.V1APIInterface) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req core.AuthLoginRequest
		if err := utils.DecodeJSON(r.Body, &req); err != nil {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}

		if !api.EnsureService(w) {
			return
		}

		if strings.TrimSpace(req.Email) == "" {
			response.Error(w, http.StatusBadRequest, "email is required")
			return
		}
		if strings.TrimSpace(req.Password) == "" {
			response.Error(w, http.StatusBadRequest, "password is required")
			return
		}

		session, err := api.Service().AuthenticateUser(r.Context(), req.Email, req.Password)
		if err != nil {
			response.Error(w, http.StatusUnauthorized, "invalid credentials")
			return
		}

		sessionID, refreshToken, refreshExpiresAt, err := api.Service().CreateSession(r.Context(), session.User.ID)
		if err != nil {
			response.Error(w, http.StatusInternalServerError, "failed to create session")
			return
		}

		accessToken, _, err := api.SignAccessToken(session.User.ID, sessionID)
		if err != nil {
			api.Logger().Printf("jwt signing error: %v", err)
			response.Error(w, http.StatusInternalServerError, "failed to issue access token")
			return
		}

		api.SetAccessTokenCookie(w, accessToken)
		api.SetRefreshTokenCookie(w, refreshToken, refreshExpiresAt)

		response.JSON(w, http.StatusOK, core.AuthLoginResponse{
			Session: *session,
		})
	}
}

// HandleRegister handles POST /api/v1/auth/register
func HandleRegister(api contracts.V1APIInterface) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		var req core.AuthRegisterRequest
		if err := utils.DecodeJSON(r.Body, &req); err != nil {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}

		if !api.EnsureService(w) {
			return
		}

		session, err := api.Service().RegisterUser(r.Context(), req)
		if err != nil {
			api.RespondServiceError(w, err)
			return
		}

		sessionID, refreshToken, refreshExpiresAt, err := api.Service().CreateSession(r.Context(), session.User.ID)
		if err != nil {
			response.Error(w, http.StatusInternalServerError, "failed to create session")
			return
		}

		accessToken, _, err := api.SignAccessToken(session.User.ID, sessionID)
		if err != nil {
			api.Logger().Printf("jwt signing error: %v", err)
			response.Error(w, http.StatusInternalServerError, "failed to issue access token")
			return
		}

		api.SetAccessTokenCookie(w, accessToken)
		api.SetRefreshTokenCookie(w, refreshToken, refreshExpiresAt)

		response.JSON(w, http.StatusCreated, core.AuthRegisterResponse{
			Session: *session,
		})
	}
}

// HandleRefresh handles POST /api/v1/auth/refresh
func HandleRefresh(api contracts.V1APIInterface) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if !api.EnsureService(w) {
			return
		}

		cookie, err := r.Cookie("nl_refresh")
		if err != nil {
			response.Error(w, http.StatusUnauthorized, "refresh token required")
			return
		}

		refreshToken := strings.TrimSpace(cookie.Value)
		if refreshToken == "" {
			response.Error(w, http.StatusUnauthorized, "refresh token required")
			return
		}

		sessionID, newRefreshToken, newExpiresAt, userID, err := api.Service().RefreshSession(r.Context(), refreshToken)
		if err != nil {
			api.RespondServiceError(w, err)
			return
		}

		accessToken, _, err := api.SignAccessToken(userID, sessionID)
		if err != nil {
			api.Logger().Printf("jwt signing error: %v", err)
			response.Error(w, http.StatusInternalServerError, "failed to issue access token")
			return
		}

		api.SetAccessTokenCookie(w, accessToken)
		api.SetRefreshTokenCookie(w, newRefreshToken, newExpiresAt)

		session, err := api.Service().GetAuthSession(r.Context(), userID)
		if err != nil {
			api.RespondServiceError(w, err)
			return
		}

		response.JSON(w, http.StatusOK, core.AuthRefreshResponse{
			Session: *session,
		})
	}
}

// HandleLogout handles POST /api/v1/auth/logout
func HandleLogout(api contracts.V1APIInterface) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !api.EnsureService(w) {
			return
		}

		sessionID := httpapicontext.SessionIDFromContext(r.Context())
		if sessionID == "" {
			response.Error(w, http.StatusUnauthorized, "invalid session")
			return
		}

		if err := api.Service().RevokeSession(r.Context(), sessionID); err != nil {
			api.RespondServiceError(w, err)
			return
		}

		api.ClearAuthCookies(w)

		response.JSON(w, http.StatusOK, core.AuthLogoutResponse{Message: "logged out"})
	}
}

// HandleGetSession handles GET /api/v1/auth/session
func HandleGetSession(api contracts.V1APIInterface) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		if !api.EnsureService(w) {
			return
		}

		userID := httpapicontext.UserIDFromContext(r.Context())

		session, err := api.Service().GetAuthSession(r.Context(), userID)
		if err != nil {
			api.Logger().Printf("auth session service error: %v", err)
			response.Error(w, http.StatusInternalServerError, "failed to load session")
			return
		}

		response.JSON(w, http.StatusOK, session)
	}
}
