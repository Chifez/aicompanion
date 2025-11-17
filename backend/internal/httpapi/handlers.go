package httpapi

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
)

func (api *API) handleHealth(w http.ResponseWriter, _ *http.Request) {
	api.respondJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (api *API) handleLogin(w http.ResponseWriter, r *http.Request) {
	var req AuthLoginRequest
	if err := decodeJSON(r.Body, &req); err != nil {
		api.respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if !api.ensureService(w) {
		return
	}

	if strings.TrimSpace(req.Email) == "" {
		api.respondError(w, http.StatusBadRequest, "email is required")
		return
	}
	if strings.TrimSpace(req.Password) == "" {
		api.respondError(w, http.StatusBadRequest, "password is required")
		return
	}

	session, err := api.service.AuthenticateUser(r.Context(), req.Email, req.Password)
	if err != nil {
		api.respondError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	sessionID, refreshToken, refreshExpiresAt, err := api.service.CreateSession(r.Context(), session.User.ID)
	if err != nil {
		api.respondError(w, http.StatusInternalServerError, "failed to create session")
		return
	}

	accessToken, _, err := api.signAccessToken(session.User.ID, sessionID)
	if err != nil {
		api.logger.Printf("jwt signing error: %v", err)
		api.respondError(w, http.StatusInternalServerError, "failed to issue access token")
		return
	}

	// Set BOTH cookies (access and refresh)
	api.setAccessTokenCookie(w, accessToken)
	api.setRefreshTokenCookie(w, refreshToken, refreshExpiresAt)

	// Return ONLY session (no tokens in body)
	api.respondJSON(w, http.StatusOK, AuthLoginResponse{
		Session: *session,
	})
}

func (api *API) handleRegister(w http.ResponseWriter, r *http.Request) {
	var req AuthRegisterRequest
	if err := decodeJSON(r.Body, &req); err != nil {
		api.respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if !api.ensureService(w) {
		return
	}

	session, err := api.service.RegisterUser(r.Context(), req)
	if err != nil {
		api.respondServiceError(w, err)
		return
	}

	sessionID, refreshToken, refreshExpiresAt, err := api.service.CreateSession(r.Context(), session.User.ID)
	if err != nil {
		api.respondError(w, http.StatusInternalServerError, "failed to create session")
		return
	}

	accessToken, _, err := api.signAccessToken(session.User.ID, sessionID)
	if err != nil {
		api.logger.Printf("jwt signing error: %v", err)
		api.respondError(w, http.StatusInternalServerError, "failed to issue access token")
		return
	}

	// Set BOTH cookies (access and refresh)
	api.setAccessTokenCookie(w, accessToken)
	api.setRefreshTokenCookie(w, refreshToken, refreshExpiresAt)

	// Return ONLY session (no tokens in body)
	api.respondJSON(w, http.StatusCreated, AuthRegisterResponse{
		Session: *session,
	})
}

func (api *API) handleRefresh(w http.ResponseWriter, r *http.Request) {
	if !api.ensureService(w) {
		return
	}

	// Read refresh token from cookie (not body)
	cookie, err := r.Cookie("nl_refresh")
	if err != nil {
		api.respondError(w, http.StatusUnauthorized, "refresh token required")
		return
	}

	refreshToken := strings.TrimSpace(cookie.Value)
	if refreshToken == "" {
		api.respondError(w, http.StatusUnauthorized, "refresh token required")
		return
	}

	sessionID, newRefreshToken, newExpiresAt, userID, err := api.service.RefreshSession(r.Context(), refreshToken)
	if err != nil {
		api.respondServiceError(w, err)
		return
	}

	accessToken, _, err := api.signAccessToken(userID, sessionID)
	if err != nil {
		api.logger.Printf("jwt signing error: %v", err)
		api.respondError(w, http.StatusInternalServerError, "failed to issue access token")
		return
	}

	// Rotate BOTH cookies
	api.setAccessTokenCookie(w, accessToken)
	api.setRefreshTokenCookie(w, newRefreshToken, newExpiresAt)

	// Load session
	session, err := api.service.GetAuthSession(r.Context(), userID)
	if err != nil {
		api.respondServiceError(w, err)
		return
	}

	// Return ONLY session (no tokens in body)
	api.respondJSON(w, http.StatusOK, AuthRefreshResponse{
		Session: *session,
	})
}

func (api *API) handleLogout(w http.ResponseWriter, r *http.Request) {
	if !api.ensureService(w) {
		return
	}

	sessionID := sessionIDFromContext(r.Context())
	if strings.TrimSpace(sessionID) == "" {
		api.respondError(w, http.StatusUnauthorized, "invalid session")
		return
	}

	if err := api.service.RevokeSession(r.Context(), sessionID); err != nil {
		api.respondServiceError(w, err)
		return
	}

	// Clear BOTH cookies
	api.clearAuthCookies(w)

	api.respondJSON(w, http.StatusOK, AuthLogoutResponse{Message: "logged out"})
}

func (api *API) handleGetSession(w http.ResponseWriter, r *http.Request) {
	if !api.ensureService(w) {
		return
	}

	userID := userIDFromContext(r.Context())

	session, err := api.service.GetAuthSession(r.Context(), userID)
	if err != nil {
		api.logger.Printf("auth session service error: %v", err)
		api.respondError(w, http.StatusInternalServerError, "failed to load session")
		return
	}

	api.respondJSON(w, http.StatusOK, session)
}

func (api *API) handleGetDashboardOverview(w http.ResponseWriter, r *http.Request) {
	if !api.ensureService(w) {
		return
	}

	overview, err := api.service.GetDashboardOverview(r.Context())
	if err != nil {
		api.logger.Printf("dashboard overview service error: %v", err)
		api.respondError(w, http.StatusInternalServerError, "failed to load dashboard")
		return
	}

	api.respondJSON(w, http.StatusOK, overview)
}

func (api *API) handleListMeetings(w http.ResponseWriter, r *http.Request) {
	if !api.ensureService(w) {
		return
	}

	resp, err := api.service.ListMeetings(r.Context())
	if err != nil {
		api.logger.Printf("list meetings service error: %v", err)
		api.respondError(w, http.StatusInternalServerError, "failed to load meetings")
		return
	}

	api.respondJSON(w, http.StatusOK, resp)
}

func (api *API) handleCreateMeeting(w http.ResponseWriter, r *http.Request) {
	var req MeetingCreateRequest
	if err := decodeJSON(r.Body, &req); err != nil {
		api.respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if !api.ensureService(w) {
		return
	}

	userID := userIDFromContext(r.Context())

	meeting, err := api.service.CreateMeeting(r.Context(), req, userID)
	if err != nil {
		api.respondServiceError(w, err)
		return
	}

	api.respondJSON(w, http.StatusCreated, MeetingDetailResponse{Meeting: *meeting})
}

func (api *API) handleGetMeeting(w http.ResponseWriter, r *http.Request) {
	meetingID := chi.URLParam(r, "meetingID")

	if !api.ensureService(w) {
		return
	}

	detail, err := api.service.GetMeeting(r.Context(), meetingID)
	if err != nil {
		api.respondServiceError(w, err)
		return
	}

	api.respondJSON(w, http.StatusOK, MeetingDetailResponse{Meeting: *detail})
}

func (api *API) handleUpdateMeeting(w http.ResponseWriter, r *http.Request) {
	meetingID := chi.URLParam(r, "meetingID")

	var req MeetingUpdateRequest
	if err := decodeJSON(r.Body, &req); err != nil {
		api.respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if !api.ensureService(w) {
		return
	}

	meeting, err := api.service.UpdateMeeting(r.Context(), meetingID, req)
	if err != nil {
		api.respondServiceError(w, err)
		return
	}

	api.respondJSON(w, http.StatusOK, MeetingDetailResponse{Meeting: *meeting})
}

func (api *API) handleDeleteMeeting(w http.ResponseWriter, r *http.Request) {
	meetingID := chi.URLParam(r, "meetingID")

	if !api.ensureService(w) {
		return
	}

	if err := api.service.DeleteMeeting(r.Context(), meetingID); err != nil {
		api.respondServiceError(w, err)
		return
	}

	api.respondJSON(w, http.StatusNoContent, nil)
}

// Host-only: explicitly start a meeting, transitioning it to active.
func (api *API) handleStartMeeting(w http.ResponseWriter, r *http.Request) {
	meetingID := chi.URLParam(r, "meetingID")

	if !api.ensureService(w) {
		return
	}

	userID := userIDFromContext(r.Context())

	detail, err := api.service.StartMeeting(r.Context(), meetingID, userID)
	if err != nil {
		api.respondServiceError(w, err)
		return
	}

	api.respondJSON(w, http.StatusOK, MeetingDetailResponse{Meeting: *detail})
}

func (api *API) handleJoinMeeting(w http.ResponseWriter, r *http.Request) {
	meetingID := chi.URLParam(r, "meetingID")

	if !api.ensureService(w) {
		return
	}

	userID := userIDFromContext(r.Context())

	joinResp, err := api.service.JoinMeeting(r.Context(), meetingID, userID)
	if err != nil {
		api.respondServiceError(w, err)
		return
	}

	joinResp.WebRTCToken = generateToken(24)
	joinResp.AIRealtimeToken = generateToken(24)
	joinResp.VoiceSynthToken = generateToken(24)
	joinResp.ExpiresAt = time.Now().Add(10 * time.Minute)
	joinResp.TurnCredentials = TurnCredentials{
		URL:      api.cfg.WebrtcTURNURL,
		Username: api.cfg.WebrtcTURNUsername,
		Password: api.cfg.WebrtcTURNPassword,
	}

	api.respondJSON(w, http.StatusOK, joinResp)
}

func (api *API) handleListTranscripts(w http.ResponseWriter, r *http.Request) {
	if !api.ensureService(w) {
		return
	}

	resp, err := api.service.ListTranscripts(r.Context())
	if err != nil {
		api.respondServiceError(w, err)
		return
	}

	api.respondJSON(w, http.StatusOK, resp)
}

func (api *API) handleGetTranscript(w http.ResponseWriter, r *http.Request) {
	transcriptID := chi.URLParam(r, "transcriptID")

	if !api.ensureService(w) {
		return
	}

	detail, err := api.service.GetTranscript(r.Context(), transcriptID)
	if err != nil {
		api.respondServiceError(w, err)
		return
	}

	api.respondJSON(w, http.StatusOK, detail)
}

func (api *API) handleGetSettings(w http.ResponseWriter, r *http.Request) {
	if !api.ensureService(w) {
		return
	}

	userID := userIDFromContext(r.Context())

	settings, err := api.service.GetSettings(r.Context(), userID)
	if err != nil {
		api.respondServiceError(w, err)
		return
	}

	api.respondJSON(w, http.StatusOK, settings)
}

func (api *API) handleUpdateSettings(w http.ResponseWriter, r *http.Request) {
	var req SettingsUpdateRequest
	if err := decodeJSON(r.Body, &req); err != nil {
		api.respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if !api.ensureService(w) {
		return
	}

	userID := userIDFromContext(r.Context())

	settings, err := api.service.UpdateSettings(r.Context(), userID, req)
	if err != nil {
		api.respondServiceError(w, err)
		return
	}

	api.respondJSON(w, http.StatusOK, settings)
}

func (api *API) handleListVoicePresets(w http.ResponseWriter, r *http.Request) {
	if !api.ensureService(w) {
		return
	}

	userID := userIDFromContext(r.Context())

	presets, err := api.service.ListVoicePresets(r.Context(), userID)
	if err != nil {
		api.respondServiceError(w, err)
		return
	}

	api.respondJSON(w, http.StatusOK, presets)
}

func (api *API) handleCreateVoicePreset(w http.ResponseWriter, r *http.Request) {
	var req CreateVoicePresetRequest
	if err := decodeJSON(r.Body, &req); err != nil {
		api.respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if !api.ensureService(w) {
		return
	}

	userID := userIDFromContext(r.Context())

	preset, err := api.service.CreateVoicePreset(r.Context(), userID, req)
	if err != nil {
		api.respondServiceError(w, err)
		return
	}

	api.respondJSON(w, http.StatusCreated, preset)
}

func (api *API) handleUpdateVoicePreset(w http.ResponseWriter, r *http.Request) {
	presetID := chi.URLParam(r, "presetID")

	var req UpdateVoicePresetRequest
	if err := decodeJSON(r.Body, &req); err != nil {
		api.respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if !api.ensureService(w) {
		return
	}

	userID := userIDFromContext(r.Context())

	preset, err := api.service.UpdateVoicePreset(r.Context(), userID, presetID, req)
	if err != nil {
		api.respondServiceError(w, err)
		return
	}

	api.respondJSON(w, http.StatusOK, preset)
}

func (api *API) handleDeleteVoicePreset(w http.ResponseWriter, r *http.Request) {
	presetID := chi.URLParam(r, "presetID")

	if !api.ensureService(w) {
		return
	}

	userID := userIDFromContext(r.Context())

	if err := api.service.DeleteVoicePreset(r.Context(), userID, presetID); err != nil {
		api.respondServiceError(w, err)
		return
	}

	api.respondJSON(w, http.StatusNoContent, nil)
}

func decodeJSON(r io.Reader, dest any) error {
	dec := json.NewDecoder(r)
	dec.DisallowUnknownFields()
	if err := dec.Decode(dest); err != nil {
		if errors.Is(err, io.EOF) {
			return errors.New("request body cannot be empty")
		}
		return err
	}
	return nil
}

func generateToken(bytes int) string {
	buf := make([]byte, bytes)
	if _, err := rand.Read(buf); err != nil {
		return ""
	}
	return base64.RawURLEncoding.EncodeToString(buf)
}

func (api *API) ensureService(w http.ResponseWriter) bool {
	if api.service != nil {
		return true
	}
	api.respondError(w, http.StatusServiceUnavailable, "service unavailable")
	return false
}

func (api *API) respondServiceError(w http.ResponseWriter, err error) {
	if err == nil {
		return
	}

	status := statusFromError(err)
	if status >= http.StatusInternalServerError {
		api.logger.Printf("service error: %v", err)
		api.respondError(w, status, "internal server error")
		return
	}

	api.respondError(w, status, err.Error())
}

func statusFromError(err error) int {
	lower := strings.ToLower(err.Error())
	switch {
	case strings.Contains(lower, "credentials"), strings.Contains(lower, "unauthorized"):
		return http.StatusUnauthorized
	case strings.Contains(lower, "refresh token"):
		return http.StatusUnauthorized
	case strings.Contains(lower, "not found"):
		return http.StatusNotFound
	case strings.Contains(lower, "conflict"),
		strings.Contains(lower, "already"):
		return http.StatusConflict
	case strings.Contains(lower, "required"),
		strings.Contains(lower, "invalid"),
		strings.Contains(lower, "must"):
		return http.StatusBadRequest
	default:
		return http.StatusInternalServerError
	}
}
