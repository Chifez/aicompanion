package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	Env            string
	HTTPPort       int
	ReadTimeoutSec int
	WriteTimeoutSec int
}

func Load() (*Config, error) {
	cfg := &Config{
		Env:            getString("APP_ENV", "development"),
		HTTPPort:       getInt("HTTP_PORT", 8080),
		ReadTimeoutSec: getInt("HTTP_READ_TIMEOUT_SEC", 15),
		WriteTimeoutSec: getInt("HTTP_WRITE_TIMEOUT_SEC", 15),
	}

	if cfg.HTTPPort <= 0 {
		return nil, fmt.Errorf("invalid HTTP_PORT: %d", cfg.HTTPPort)
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

