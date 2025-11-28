package handlers

import (
	"net/http"
	"time"

	"github.com/aicomp/ai-virtual-chat/backend/internal/core"
	httpapicontext "github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/context"
	"github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/contracts"
	"github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/response"
	"github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/utils"
	"github.com/aicomp/ai-virtual-chat/backend/internal/services"
	"github.com/go-chi/chi/v5"
)

// HandleListMeetings handles GET /api/v1/meetings
func HandleListMeetings(api contracts.V1APIInterface) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if !api.EnsureService(w) {
			return
		}

		userID := httpapicontext.UserIDFromContext(r.Context())

		resp, err := api.Service().ListMeetings(r.Context(), userID)
		if err != nil {
			api.Logger().Printf("list meetings service error: %v", err)
			response.Error(w, http.StatusInternalServerError, "failed to load meetings")
			return
		}

		response.JSON(w, http.StatusOK, resp)
	}
}

// HandleCreateMeeting handles POST /api/v1/meetings
func HandleCreateMeeting(api contracts.V1APIInterface) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		var req core.MeetingCreateRequest
		if err := utils.DecodeJSON(r.Body, &req); err != nil {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}

		if !api.EnsureService(w) {
			return
		}

		userID := httpapicontext.UserIDFromContext(r.Context())

		meeting, err := api.Service().CreateMeeting(r.Context(), req, userID)
		if err != nil {
			api.RespondServiceError(w, err)
			return
		}

		response.JSON(w, http.StatusCreated, core.MeetingDetailResponse{Meeting: *meeting})
	}
}

// HandleGetMeeting handles GET /api/v1/meetings/{meetingID}
func HandleGetMeeting(api contracts.V1APIInterface) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		meetingID := chi.URLParam(r, "meetingID")
		if err := utils.ValidateID(meetingID); err != nil {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}

		if !api.EnsureService(w) {
			return
		}

		userID := httpapicontext.UserIDFromContext(r.Context())

		detail, err := api.Service().GetMeeting(r.Context(), meetingID)
		if err != nil {
			api.RespondServiceError(w, err)
			return
		}

		// Check ownership - only host can access private meetings
		// For public meetings, we allow read access but ownership check still applies for modifications
		if detail.Summary.Visibility == "private" {
			if err := utils.CheckMeetingOwnership(detail.Summary.HostUserID, userID); err != nil {
				response.Error(w, http.StatusForbidden, "unauthorized: you do not have access to this meeting")
				return
			}
		}

		response.JSON(w, http.StatusOK, core.MeetingDetailResponse{Meeting: *detail})
	}
}

// HandleUpdateMeeting handles PATCH /api/v1/meetings/{meetingID}
func HandleUpdateMeeting(api contracts.V1APIInterface) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		meetingID := chi.URLParam(r, "meetingID")
		if err := utils.ValidateID(meetingID); err != nil {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}

		var req core.MeetingUpdateRequest
		if err := utils.DecodeJSON(r.Body, &req); err != nil {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}

		if !api.EnsureService(w) {
			return
		}

		userID := httpapicontext.UserIDFromContext(r.Context())

		// Check ownership and if meeting is actionable before updating
		existing, err := api.Service().GetMeeting(r.Context(), meetingID)
		if err != nil {
			api.RespondServiceError(w, err)
			return
		}
		if err := utils.CheckMeetingOwnership(existing.Summary.HostUserID, userID); err != nil {
			response.Error(w, http.StatusForbidden, "unauthorized: you do not own this meeting")
			return
		}
		// Validate meeting action (ended/past meetings cannot be updated)
		if err := utils.ValidateMeetingAction(existing.Summary.Status, existing.Summary.StartTime, existing.Summary.DurationMinutes); err != nil {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}

		meeting, err := api.Service().UpdateMeeting(r.Context(), meetingID, req)
		if err != nil {
			api.RespondServiceError(w, err)
			return
		}

		response.JSON(w, http.StatusOK, core.MeetingDetailResponse{Meeting: *meeting})
	}
}

// HandleDeleteMeeting handles DELETE /api/v1/meetings/{meetingID}
func HandleDeleteMeeting(api contracts.V1APIInterface) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		meetingID := chi.URLParam(r, "meetingID")
		if err := utils.ValidateID(meetingID); err != nil {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}

		if !api.EnsureService(w) {
			return
		}

		userID := httpapicontext.UserIDFromContext(r.Context())

		// Check ownership before deleting (deletion allowed even for ended meetings)
		existing, err := api.Service().GetMeeting(r.Context(), meetingID)
		if err != nil {
			api.RespondServiceError(w, err)
			return
		}
		if err := utils.CheckMeetingOwnership(existing.Summary.HostUserID, userID); err != nil {
			response.Error(w, http.StatusForbidden, "unauthorized: you do not own this meeting")
			return
		}
		// Note: Deletion is allowed for ended/past meetings, so we don't validate action here

		if err := api.Service().DeleteMeeting(r.Context(), meetingID); err != nil {
			api.RespondServiceError(w, err)
			return
		}

		response.JSON(w, http.StatusNoContent, nil)
	}
}

// HandleStartMeeting handles POST /api/v1/meetings/{meetingID}/start
func HandleStartMeeting(api contracts.V1APIInterface) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		meetingID := chi.URLParam(r, "meetingID")
		if err := utils.ValidateID(meetingID); err != nil {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}

		if !api.EnsureService(w) {
			return
		}

		userID := httpapicontext.UserIDFromContext(r.Context())

		// Check if meeting exists and is actionable before attempting to start
		existing, err := api.Service().GetMeeting(r.Context(), meetingID)
		if err != nil {
			api.RespondServiceError(w, err)
			return
		}

		// Validate meeting action (check if ended or past)
		if err := utils.ValidateMeetingAction(existing.Summary.Status, existing.Summary.StartTime, existing.Summary.DurationMinutes); err != nil {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}

		// Check ownership
		if err := utils.CheckMeetingOwnership(existing.Summary.HostUserID, userID); err != nil {
			response.Error(w, http.StatusForbidden, "unauthorized: you do not own this meeting")
			return
		}

		detail, err := api.Service().StartMeeting(r.Context(), meetingID, userID)
		if err != nil {
			api.RespondServiceError(w, err)
			return
		}

		response.JSON(w, http.StatusOK, core.MeetingDetailResponse{Meeting: *detail})
	}
}

// HandleJoinMeeting handles POST /api/v1/meetings/{meetingID}/join
func HandleJoinMeeting(api contracts.V1APIInterface) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		meetingID := chi.URLParam(r, "meetingID")
		if err := utils.ValidateID(meetingID); err != nil {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}

		if !api.EnsureService(w) {
			return
		}

		userID := httpapicontext.UserIDFromContext(r.Context())

		// Get user info for LiveKit token
		authSession, err := api.Service().GetAuthSession(r.Context(), userID)
		if err != nil {
			api.RespondServiceError(w, err)
			return
		}

		joinResp, err := api.Service().JoinMeeting(r.Context(), meetingID, userID)
		if err != nil {
			api.RespondServiceError(w, err)
			return
		}

		// Generate LiveKit token if configured
		cfg := api.Cfg()
		if cfg.LiveKitURL != "" && cfg.LiveKitAPIKey != "" && cfg.LiveKitAPISecret != "" {
			livekitToken, err := services.GenerateLiveKitToken(
				cfg.LiveKitAPIKey,
				cfg.LiveKitAPISecret,
				userID,
				authSession.User.Name,
				meetingID, // Use meetingID as room name
				true,      // canPublish
				true,      // canSubscribe
			)
			if err != nil {
				api.Logger().Printf("failed to generate LiveKit token: %v", err)
				// Continue without LiveKit token if generation fails
			} else {
				joinResp.LiveKitToken = livekitToken
				joinResp.LiveKitURL = cfg.LiveKitURL
			}
		}

		// Legacy tokens (keep for backward compatibility)
		joinResp.WebRTCToken = utils.GenerateToken(24)
		joinResp.AIRealtimeToken = utils.GenerateToken(24)
		joinResp.VoiceSynthToken = utils.GenerateToken(24)
		joinResp.ExpiresAt = time.Now().Add(10 * time.Minute)
		joinResp.TurnCredentials = core.TurnCredentials{
			URL:      cfg.WebrtcTURNURL,
			Username: cfg.WebrtcTURNUsername,
			Password: cfg.WebrtcTURNPassword,
		}

		response.JSON(w, http.StatusOK, joinResp)
	}
}
