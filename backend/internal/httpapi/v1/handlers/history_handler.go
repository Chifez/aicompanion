package handlers

import (
	"net/http"

	"github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/contracts"
	"github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/response"
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

		if !api.EnsureService(w) {
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
