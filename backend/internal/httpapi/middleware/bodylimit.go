package middleware

import (
	"io"
	"net/http"
)

const (
	// DefaultMaxBodySize is 10MB - reasonable for most API requests
	DefaultMaxBodySize = 10 << 20 // 10MB
)

// MaxBodySize limits the size of request bodies to prevent abuse
func MaxBodySize(maxBytes int64) func(http.Handler) http.Handler {
	if maxBytes <= 0 {
		maxBytes = DefaultMaxBodySize
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Limit body size
			r.Body = http.MaxBytesReader(w, r.Body, maxBytes)

			// Continue to next handler
			next.ServeHTTP(w, r)
		})
	}
}

// ContentTypeJSON ensures Content-Type is application/json for POST/PUT/PATCH requests
func ContentTypeJSON(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Only check for methods that typically have bodies
		if r.Method == "POST" || r.Method == "PUT" || r.Method == "PATCH" {
			contentType := r.Header.Get("Content-Type")
			// Allow application/json and application/json; charset=utf-8
			if contentType != "" && contentType != "application/json" && contentType != "application/json; charset=utf-8" {
				// For requests with body, require JSON content type
				if r.ContentLength > 0 {
					w.Header().Set("Content-Type", "application/json")
					w.WriteHeader(http.StatusUnsupportedMediaType)
					_, _ = io.WriteString(w, `{"message":"Content-Type must be application/json"}`)
					return
				}
			}
		}

		next.ServeHTTP(w, r)
	})
}
