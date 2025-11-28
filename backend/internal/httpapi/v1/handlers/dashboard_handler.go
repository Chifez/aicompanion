package handlers

import (
	"net/http"

	httpapicontext "github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/context"
	"github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/contracts"
	"github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/response"
)

// HandleGetDashboardOverview handles GET /api/v1/dashboard/overview
func HandleGetDashboardOverview(api contracts.V1APIInterface) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if !api.EnsureService(w) {
			return
		}

		userID := httpapicontext.UserIDFromContext(r.Context())

		overview, err := api.Service().GetDashboardOverview(r.Context(), userID)
		if err != nil {
			api.Logger().Printf("dashboard overview service error: %v", err)
			response.Error(w, http.StatusInternalServerError, "failed to load dashboard")
			return
		}

		response.JSON(w, http.StatusOK, overview)
	}
}
