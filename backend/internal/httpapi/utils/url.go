package utils

import (
	"net/url"
	"strings"
)

// SanitizeRedirectURL sanitizes a redirect URL by:
// - Removing spaces and special characters that could cause issues
// - Ensuring it's a valid path
// - Removing any query parameters or fragments that could be malicious
func SanitizeRedirectURL(redirectPath string) string {
	if redirectPath == "" {
		return ""
	}

	// Remove leading/trailing whitespace
	redirectPath = strings.TrimSpace(redirectPath)

	// Remove any spaces in the middle
	redirectPath = strings.ReplaceAll(redirectPath, " ", "")

	// Parse as URL to validate
	parsed, err := url.Parse(redirectPath)
	if err != nil {
		return ""
	}

	// Only allow path, no scheme, host, query, or fragment
	// This ensures it's a relative path
	if parsed.Scheme != "" || parsed.Host != "" {
		return ""
	}

	// Clean the path
	cleanPath := parsed.Path

	// Ensure it starts with /
	if !strings.HasPrefix(cleanPath, "/") {
		cleanPath = "/" + cleanPath
	}

	// Remove any dangerous characters (but keep /)
	cleanPath = strings.ReplaceAll(cleanPath, "\n", "")
	cleanPath = strings.ReplaceAll(cleanPath, "\r", "")
	cleanPath = strings.ReplaceAll(cleanPath, "\t", "")

	return cleanPath
}
