package handlers

import (
	"net/http"
	"time"

	"github.com/aicomp/ai-virtual-chat/backend/internal/core"
	httpapicontext "github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/context"
	"github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/contracts"
	"github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/response"
	"github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/utils"
	"github.com/go-chi/chi/v5"
)

// HandleListMeetings handles GET /api/v1/meetings
func HandleListMeetings(api contracts.V1APIInterface) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if !api.EnsureService(w) {
			return
		}

		resp, err := api.Service().ListMeetings(r.Context())
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

		if !api.EnsureService(w) {
			return
		}

		detail, err := api.Service().GetMeeting(r.Context(), meetingID)
		if err != nil {
			api.RespondServiceError(w, err)
			return
		}

		response.JSON(w, http.StatusOK, core.MeetingDetailResponse{Meeting: *detail})
	}
}

// HandleUpdateMeeting handles PATCH /api/v1/meetings/{meetingID}
func HandleUpdateMeeting(api contracts.V1APIInterface) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		meetingID := chi.URLParam(r, "meetingID")

		var req core.MeetingUpdateRequest
		if err := utils.DecodeJSON(r.Body, &req); err != nil {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}

		if !api.EnsureService(w) {
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

		if !api.EnsureService(w) {
			return
		}

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

		if !api.EnsureService(w) {
			return
		}

		userID := httpapicontext.UserIDFromContext(r.Context())

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

		if !api.EnsureService(w) {
			return
		}

		userID := httpapicontext.UserIDFromContext(r.Context())

		joinResp, err := api.Service().JoinMeeting(r.Context(), meetingID, userID)
		if err != nil {
			api.RespondServiceError(w, err)
			return
		}

		joinResp.WebRTCToken = utils.GenerateToken(24)
		joinResp.AIRealtimeToken = utils.GenerateToken(24)
		joinResp.VoiceSynthToken = utils.GenerateToken(24)
		joinResp.ExpiresAt = time.Now().Add(10 * time.Minute)
		joinResp.TurnCredentials = core.TurnCredentials{
			URL:      api.Cfg().WebrtcTURNURL,
			Username: api.Cfg().WebrtcTURNUsername,
			Password: api.Cfg().WebrtcTURNPassword,
		}

		response.JSON(w, http.StatusOK, joinResp)
	}
}
