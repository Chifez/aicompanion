package handlers

import (
	"net/http"

	"github.com/aicomp/ai-virtual-chat/backend/internal/core"
	httpapicontext "github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/context"
	"github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/contracts"
	"github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/response"
	"github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/utils"
	"github.com/go-chi/chi/v5"
)

// HandleGetSettings handles GET /api/v1/settings
func HandleGetSettings(api contracts.V1APIInterface) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		if !api.EnsureService(w) {
			return
		}

		userID := httpapicontext.UserIDFromContext(r.Context())

		settings, err := api.Service().GetSettings(r.Context(), userID)
		if err != nil {
			api.RespondServiceError(w, err)
			return
		}

		response.JSON(w, http.StatusOK, settings)
	}
}

// HandleUpdateSettings handles PUT /api/v1/settings
func HandleUpdateSettings(api contracts.V1APIInterface) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		var req core.SettingsUpdateRequest
		if err := utils.DecodeJSON(r.Body, &req); err != nil {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}

		if !api.EnsureService(w) {
			return
		}

		userID := httpapicontext.UserIDFromContext(r.Context())

		settings, err := api.Service().UpdateSettings(r.Context(), userID, req)
		if err != nil {
			api.RespondServiceError(w, err)
			return
		}

		response.JSON(w, http.StatusOK, settings)
	}
}

// HandleListVoicePresets handles GET /api/v1/settings/presets
func HandleListVoicePresets(api contracts.V1APIInterface) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if !api.EnsureService(w) {
			return
		}

		userID := httpapicontext.UserIDFromContext(r.Context())

		presets, err := api.Service().ListVoicePresets(r.Context(), userID)
		if err != nil {
			api.RespondServiceError(w, err)
			return
		}

		response.JSON(w, http.StatusOK, presets)
	}
}

// HandleCreateVoicePreset handles POST /api/v1/settings/presets
func HandleCreateVoicePreset(api contracts.V1APIInterface) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		var req core.CreateVoicePresetRequest
		if err := utils.DecodeJSON(r.Body, &req); err != nil {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}

		if !api.EnsureService(w) {
			return
		}

		userID := httpapicontext.UserIDFromContext(r.Context())

		preset, err := api.Service().CreateVoicePreset(r.Context(), userID, req)
		if err != nil {
			api.RespondServiceError(w, err)
			return
		}

		response.JSON(w, http.StatusCreated, preset)
	}
}

// HandleUpdateVoicePreset handles PUT /api/v1/settings/presets/{presetID}
func HandleUpdateVoicePreset(api contracts.V1APIInterface) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		presetID := chi.URLParam(r, "presetID")

		var req core.UpdateVoicePresetRequest
		if err := utils.DecodeJSON(r.Body, &req); err != nil {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}

		if !api.EnsureService(w) {
			return
		}

		userID := httpapicontext.UserIDFromContext(r.Context())

		preset, err := api.Service().UpdateVoicePreset(r.Context(), userID, presetID, req)
		if err != nil {
			api.RespondServiceError(w, err)
			return
		}

		response.JSON(w, http.StatusOK, preset)
	}
}

// HandleDeleteVoicePreset handles DELETE /api/v1/settings/presets/{presetID}
func HandleDeleteVoicePreset(api contracts.V1APIInterface) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		presetID := chi.URLParam(r, "presetID")

		if !api.EnsureService(w) {
			return
		}

		userID := httpapicontext.UserIDFromContext(r.Context())

		if err := api.Service().DeleteVoicePreset(r.Context(), userID, presetID); err != nil {
			api.RespondServiceError(w, err)
			return
		}

		response.JSON(w, http.StatusNoContent, nil)
	}
}
