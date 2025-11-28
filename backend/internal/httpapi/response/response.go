package response

import (
	"encoding/json"
	"net/http"
)

// JSON writes a JSON response with the given status code and payload
func JSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if payload == nil {
		return
	}
	_ = json.NewEncoder(w).Encode(payload)
}

// Error writes a JSON error response
func Error(w http.ResponseWriter, status int, msg string) {
	JSON(w, status, ErrorResponse{Message: msg})
}

// ErrorResponse represents an API error response
type ErrorResponse struct {
	Message string `json:"message"`
}

