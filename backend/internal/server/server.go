package server

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/aicomp/ai-virtual-chat/backend/internal/config"
	"github.com/aicomp/ai-virtual-chat/backend/internal/httpapi"
	"github.com/aicomp/ai-virtual-chat/backend/internal/infrastructure"
	"github.com/aicomp/ai-virtual-chat/backend/internal/migrate"
	"github.com/aicomp/ai-virtual-chat/backend/internal/services"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
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
	api    *httpapi.API
	pg     *pgxpool.Pool
	redis  *redis.Client
}

func New(cfg *config.Config, logger Logger) (*Server, error) {
	ctx := context.Background()

	var pgPool *pgxpool.Pool
	if cfg.PostgresDSN != "" {
		pool, err := infrastructure.NewPostgresPool(ctx, cfg.PostgresDSN, cfg.PostgresMaxOpenConns, cfg.PostgresMaxIdleConns)
		if err != nil {
			return nil, err
		}
		if err := migrate.Run(ctx, pool); err != nil {
			pool.Close()
			return nil, fmt.Errorf("run migrations: %w", err)
		}
		if err := services.Seed(ctx, pool, logger); err != nil {
			pool.Close()
			return nil, fmt.Errorf("seed database: %w", err)
		}
		pgPool = pool
		logger.Println("postgres connected")
	} else {
		logger.Println("postgres dsn not provided, running without database connection")
	}

	var redisClient *redis.Client
	if cfg.RedisURL != "" {
		client, err := infrastructure.NewRedisClient(ctx, cfg.RedisURL, cfg.RedisPoolSize)
		if err != nil {
			if pgPool != nil {
				pgPool.Close()
			}
			return nil, err
		}
		redisClient = client
		logger.Println("redis connected")
	} else {
		logger.Println("redis url not provided, running without redis connection")
	}

	var appService *services.AppService
	if pgPool != nil {
		appService = services.NewAppService(pgPool)
	}

	api := httpapi.New(cfg, logger, httpapi.Dependencies{
		Postgres: pgPool,
		Redis:    redisClient,
		Service:  appService,
	})

	httpServer := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.HTTPPort),
		Handler:      api.Routes(),
		ReadTimeout:  time.Duration(cfg.ReadTimeoutSec) * time.Second,
		WriteTimeout: time.Duration(cfg.WriteTimeoutSec) * time.Second,
	}

	return &Server{
		cfg:    cfg,
		logger: logger,
		http:   httpServer,
		api:    api,
		pg:     pgPool,
		redis:  redisClient,
	}, nil
}

func (s *Server) Start() error {
	s.logger.Printf("http server listening on %s", s.http.Addr)
	return s.http.ListenAndServe()
}

func (s *Server) Stop(ctx context.Context) error {
	// Stop API background processes (rate limiter cleanup)
	if s.api != nil {
		s.api.Stop()
	}

	err := s.http.Shutdown(ctx)

	if s.pg != nil {
		s.pg.Close()
	}
	if s.redis != nil {
		if closeErr := s.redis.Close(); closeErr != nil && !errors.Is(closeErr, context.Canceled) {
			s.logger.Printf("redis close error: %v", closeErr)
		}
	}

	return err
}
