package v1

import (
	"github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/v1/handlers"
	"github.com/go-chi/chi/v5"
)

func (api *API) Routes() chi.Router {
	r := chi.NewRouter()

	// Public auth routes
	r.Post("/auth/register", handlers.HandleRegister(api))
	r.Post("/auth/login", handlers.HandleLogin(api))
	r.Post("/auth/refresh", handlers.HandleRefresh(api))

	// Protected routes (require authentication)
	r.Group(func(pr chi.Router) {
		pr.Use(api.AuthMiddleware)

		// Auth
		pr.Get("/auth/session", handlers.HandleGetSession(api))
		pr.Post("/auth/logout", handlers.HandleLogout(api))

		// Dashboard
		pr.Get("/dashboard/overview", handlers.HandleGetDashboardOverview(api))

		// Meetings
		pr.Route("/meetings", func(r chi.Router) {
			r.Get("/", handlers.HandleListMeetings(api))
			r.Post("/", handlers.HandleCreateMeeting(api))

			r.Route("/{meetingID}", func(r chi.Router) {
				r.Get("/", handlers.HandleGetMeeting(api))
				r.Patch("/", handlers.HandleUpdateMeeting(api))
				r.Delete("/", handlers.HandleDeleteMeeting(api))
				r.Post("/start", handlers.HandleStartMeeting(api))
				r.Post("/join", handlers.HandleJoinMeeting(api))
			})
		})

		// History
		pr.Get("/history", handlers.HandleListTranscripts(api))
		pr.Get("/history/{transcriptID}", handlers.HandleGetTranscript(api))

		// Settings
		pr.Route("/settings", func(r chi.Router) {
			r.Get("/", handlers.HandleGetSettings(api))
			r.Put("/", handlers.HandleUpdateSettings(api))
			r.Get("/presets", handlers.HandleListVoicePresets(api))
			r.Post("/presets", handlers.HandleCreateVoicePreset(api))
			r.Route("/presets/{presetID}", func(r chi.Router) {
				r.Put("/", handlers.HandleUpdateVoicePreset(api))
				r.Delete("/", handlers.HandleDeleteVoicePreset(api))
			})
		})
	})

	return r
}
