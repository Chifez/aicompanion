package httpapi

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/aicomp/ai-virtual-chat/backend/internal/config"
	"github.com/aicomp/ai-virtual-chat/backend/internal/services"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type Logger interface {
	Println(v ...any)
	Printf(format string, v ...any)
}

type Dependencies struct {
	Postgres *pgxpool.Pool
	Redis    *redis.Client
	Service  *services.AppService
}

type API struct {
	cfg     *config.Config
	logger  Logger
	service *services.AppService
}

func New(cfg *config.Config, logger Logger, deps Dependencies) *API {
	return &API{
		cfg:     cfg,
		logger:  logger,
		service: deps.Service,
	}
}

func (api *API) Routes() http.Handler {
	router := chi.NewRouter()

	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(middleware.Recoverer)
	router.Use(middleware.Timeout(60 * time.Second))
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		MaxAge:         300,
	}))

	router.Get("/healthz", api.handleHealth)

	router.Route("/api", func(r chi.Router) {
		r.Post("/auth/register", api.handleRegister)
		r.Post("/auth/login", api.handleLogin)

		r.Group(func(pr chi.Router) {
			pr.Use(api.authMiddleware)

			pr.Get("/auth/session", api.handleGetSession)
			pr.Get("/dashboard/overview", api.handleGetDashboardOverview)

			pr.Route("/meetings", func(r chi.Router) {
				r.Get("/", api.handleListMeetings)
				r.Post("/", api.handleCreateMeeting)

				r.Route("/{meetingID}", func(r chi.Router) {
					r.Get("/", api.handleGetMeeting)
					r.Patch("/", api.handleUpdateMeeting)
					r.Delete("/", api.handleDeleteMeeting)
					r.Post("/join", api.handleJoinMeeting)
				})
			})

			pr.Get("/history", api.handleListTranscripts)
			pr.Get("/history/{transcriptID}", api.handleGetTranscript)

			pr.Route("/settings", func(r chi.Router) {
				r.Get("/", api.handleGetSettings)
				r.Put("/", api.handleUpdateSettings)
				r.Get("/presets", api.handleListVoicePresets)
				r.Post("/presets", api.handleCreateVoicePreset)
				r.Route("/presets/{presetID}", func(r chi.Router) {
					r.Put("/", api.handleUpdateVoicePreset)
					r.Delete("/", api.handleDeleteVoicePreset)
				})
			})
		})
	})

	return router
}

func (api *API) respondJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if payload == nil {
		return
	}
	_ = json.NewEncoder(w).Encode(payload)
}

func (api *API) respondError(w http.ResponseWriter, status int, msg string) {
	api.respondJSON(w, status, APIError{Message: msg})
}
