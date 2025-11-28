package response

import (
	"net/http"
	"strings"
)

// StatusFromError determines the appropriate HTTP status code from an error message
func StatusFromError(err error) int {
	if err == nil {
		return http.StatusOK
	}

	lower := strings.ToLower(err.Error())
	switch {
	case strings.Contains(lower, "credentials"), strings.Contains(lower, "unauthorized"):
		return http.StatusUnauthorized
	case strings.Contains(lower, "refresh token"):
		return http.StatusUnauthorized
	case strings.Contains(lower, "not found"):
		return http.StatusNotFound
	case strings.Contains(lower, "conflict"),
		strings.Contains(lower, "already"):
		return http.StatusConflict
	case strings.Contains(lower, "required"),
		strings.Contains(lower, "invalid"),
		strings.Contains(lower, "must"):
		return http.StatusBadRequest
	default:
		return http.StatusInternalServerError
	}
}

