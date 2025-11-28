package httpapi

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/aicomp/ai-virtual-chat/backend/internal/config"
	"github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/contracts"
	"github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/response"
	v1 "github.com/aicomp/ai-virtual-chat/backend/internal/httpapi/v1"
	"github.com/aicomp/ai-virtual-chat/backend/internal/services"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type Dependencies struct {
	Postgres *pgxpool.Pool
	Redis    *redis.Client
	Service  *services.AppService
}

type API struct {
	cfg     *config.Config
	logger  contracts.Logger
	service *services.AppService
}

func New(cfg *config.Config, logger contracts.Logger, deps Dependencies) *API {
	return &API{
		cfg:     cfg,
		logger:  logger,
		service: deps.Service,
	}
}

// Routes sets up all HTTP routes
func (api *API) Routes() http.Handler {
	router := chi.NewRouter()

	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(middleware.Recoverer)
	router.Use(middleware.Timeout(60 * time.Second))
	router.Use(cors.Handler(cors.Options{
		// In development, allow the Vite/React dev server origins.
		// In production, this should be restricted to your real frontend origin.
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health check (no versioning)
	router.Get("/healthz", api.HandleHealth)

	// Versioned API routes
	router.Route("/api/v1", func(r chi.Router) {
		v1API := v1.NewAPI(api)
		r.Mount("/", v1API.Routes())

	})

	return router
}

// RespondJSON writes a JSON response
func (api *API) RespondJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if payload == nil {
		return
	}
	_ = json.NewEncoder(w).Encode(payload)
}

// RespondError writes an error response
func (api *API) RespondError(w http.ResponseWriter, status int, msg string) {
	api.RespondJSON(w, status, APIError{Message: msg})
}

// Service returns the app service
func (api *API) Service() *services.AppService {
	return api.service
}

// Logger returns the logger
func (api *API) Logger() contracts.Logger {
	return api.logger
}

// Cfg returns the config
func (api *API) Cfg() *config.Config {
	return api.cfg
}

// EnsureService checks if service is available
func (api *API) EnsureService(w http.ResponseWriter) bool {
	if api.service != nil {
		return true
	}
	api.RespondError(w, http.StatusServiceUnavailable, "service unavailable")
	return false
}

// RespondServiceError handles service errors with appropriate status codes
func (api *API) RespondServiceError(w http.ResponseWriter, err error) {
	if err == nil {
		return
	}

	status := response.StatusFromError(err)
	if status >= http.StatusInternalServerError {
		api.logger.Printf("service error: %v", err)
		api.RespondError(w, status, "internal server error")
		return
	}

	api.RespondError(w, status, err.Error())
}

// HandleHealth handles GET /healthz
func (api *API) HandleHealth(w http.ResponseWriter, r *http.Request) {
	api.RespondJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
