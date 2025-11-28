package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	Env                  string
	LogLevel             string
	HTTPPort             int
	ReadTimeoutSec       int
	WriteTimeoutSec      int
	PostgresDSN          string
	PostgresMaxOpenConns int
	PostgresMaxIdleConns int
	RedisURL             string
	RedisPoolSize        int
	JWTSecret            string
	OpenAIAPIKey         string
	OpenAIRealtimeModel  string
	ElevenLabsAPIKey     string
	ElevenLabsVoiceID    string
	WebrtcSFUURL         string
	WebrtcTURNURL        string
	WebrtcTURNUsername   string
	WebrtcTURNPassword   string
	LiveKitURL           string
	LiveKitAPIKey        string
	LiveKitAPISecret     string
}

func Load() (*Config, error) {
	cfg := &Config{
		Env:                  getString("APP_ENV", "development"),
		LogLevel:             getString("LOG_LEVEL", "info"),
		HTTPPort:             getInt("HTTP_PORT", 8080),
		ReadTimeoutSec:       getInt("HTTP_READ_TIMEOUT_SEC", 15),
		WriteTimeoutSec:      getInt("HTTP_WRITE_TIMEOUT_SEC", 15),
		PostgresDSN:          getString("POSTGRES_DSN", ""),
		PostgresMaxOpenConns: getInt("POSTGRES_MAX_OPEN_CONNS", 20),
		PostgresMaxIdleConns: getInt("POSTGRES_MAX_IDLE_CONNS", 10),
		RedisURL:             getString("REDIS_URL", ""),
		RedisPoolSize:        getInt("REDIS_POOL_SIZE", 20),
		JWTSecret:            getString("JWT_SECRET", ""),
		OpenAIAPIKey:         getString("OPENAI_API_KEY", ""),
		OpenAIRealtimeModel:  getString("OPENAI_REALTIME_MODEL", "gpt-4o-realtime-preview"),
		ElevenLabsAPIKey:     getString("ELEVENLABS_API_KEY", ""),
		ElevenLabsVoiceID:    getString("ELEVENLABS_VOICE_ID", ""),
		WebrtcSFUURL:         getString("WEBRTC_SFU_URL", ""),
		WebrtcTURNURL:        getString("WEBRTC_TURN_URL", ""),
		WebrtcTURNUsername:   getString("WEBRTC_TURN_USERNAME", ""),
		WebrtcTURNPassword:   getString("WEBRTC_TURN_PASSWORD", ""),
		LiveKitURL:           getString("LIVEKIT_URL", ""),
		LiveKitAPIKey:        getString("LIVEKIT_API_KEY", ""),
		LiveKitAPISecret:     getString("LIVEKIT_API_SECRET", ""),
	}

	if cfg.HTTPPort <= 0 {
		return nil, fmt.Errorf("invalid HTTP_PORT: %d", cfg.HTTPPort)
	}

	if err := validateSecret(cfg.JWTSecret); err != nil {
		return nil, err
	}

	return cfg, nil
}

func getString(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

func getInt(key string, fallback int) int {
	if val := os.Getenv(key); val != "" {
		if parsed, err := strconv.Atoi(val); err == nil {
			return parsed
		}
	}
	return fallback
}

func validateSecret(secret string) error {
	if secret == "" {
		return fmt.Errorf("JWT_SECRET must be provided")
	}
	if len(secret) < 16 {
		return fmt.Errorf("JWT_SECRET must be at least 16 characters long")
	}
	return nil
}
