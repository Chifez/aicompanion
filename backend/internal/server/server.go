package server

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/aicomp/ai-virtual-chat/backend/internal/config"
)

type Logger interface {
	Println(v ...any)
	Printf(format string, v ...any)
	Fatalf(format string, v ...any)
}

type Server struct {
	cfg    *config.Config
	logger Logger
	http   *http.Server
}

func New(cfg *config.Config, logger Logger) *Server {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})

	httpServer := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.HTTPPort),
		Handler:      mux,
		ReadTimeout:  time.Duration(cfg.ReadTimeoutSec) * time.Second,
		WriteTimeout: time.Duration(cfg.WriteTimeoutSec) * time.Second,
	}

	return &Server{
		cfg:    cfg,
		logger: logger,
		http:   httpServer,
	}
}

func (s *Server) Start() error {
	s.logger.Printf("http server listening on %s", s.http.Addr)
	return s.http.ListenAndServe()
}

func (s *Server) Stop(ctx context.Context) error {
	return s.http.Shutdown(ctx)
}

