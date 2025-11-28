package handlers

import (
	"net/http"

	httpapicontext "github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/context"
	"github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/contracts"
	"github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/response"
	"github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/utils"
	"github.com/go-chi/chi/v5"
)

// HandleListTranscripts handles GET /api/v1/history
func HandleListTranscripts(api contracts.V1APIInterface) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if !api.EnsureService(w) {
			return
		}

		resp, err := api.Service().ListTranscripts(r.Context())
		if err != nil {
			api.RespondServiceError(w, err)
			return
		}

		response.JSON(w, http.StatusOK, resp)
	}
}

// HandleGetTranscript handles GET /api/v1/history/{transcriptID}
func HandleGetTranscript(api contracts.V1APIInterface) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		transcriptID := chi.URLParam(r, "transcriptID")
		if err := utils.ValidateID(transcriptID); err != nil {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}

		if !api.EnsureService(w) {
			return
		}

		userID := httpapicontext.UserIDFromContext(r.Context())

		// Check ownership before fetching transcript details
		if err := api.Service().CheckTranscriptOwnership(r.Context(), transcriptID, userID); err != nil {
			if err.Error() == "transcript not found" {
				response.Error(w, http.StatusNotFound, err.Error())
			} else {
				response.Error(w, http.StatusForbidden, "unauthorized: you do not own this transcript")
			}
			return
		}

		detail, err := api.Service().GetTranscript(r.Context(), transcriptID)
		if err != nil {
			api.RespondServiceError(w, err)
			return
		}

		response.JSON(w, http.StatusOK, detail)
	}
}
