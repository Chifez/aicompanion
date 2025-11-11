package main

import (
	"context"
	"log"
	"os/signal"
	"syscall"
	"time"

	"github.com/aicomp/ai-virtual-chat/backend/internal/config"
	"github.com/aicomp/ai-virtual-chat/backend/internal/logger"
	"github.com/aicomp/ai-virtual-chat/backend/internal/server"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	logr := logger.New(cfg.Env)

	httpServer := server.New(cfg, logr)

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	go func() {
		if err := httpServer.Start(); err != nil {
			logr.Fatalf("server error: %v", err)
		}
	}()

	<-ctx.Done()
	stop()

	logr.Println("shutting down server")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := httpServer.Stop(shutdownCtx); err != nil {
		logr.Fatalf("failed to shutdown gracefully: %v", err)
	}

	logr.Println("server exited")
}

