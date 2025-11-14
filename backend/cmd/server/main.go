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
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load(".env")
	_ = godotenv.Load("../.env")

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	logr := logger.New(cfg.Env)

	httpServer, err := server.New(cfg, logr)
	if err != nil {
		logr.Fatalf("failed to initialize server: %v", err)
	}

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
