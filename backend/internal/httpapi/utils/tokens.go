package utils

import (
	"crypto/rand"
	"encoding/base64"
)

// GenerateToken generates a cryptographically secure random token
// Returns a base64 URL-encoded string of the specified byte length
func GenerateToken(bytes int) string {
	buf := make([]byte, bytes)
	if _, err := rand.Read(buf); err != nil {
		return ""
	}
	return base64.RawURLEncoding.EncodeToString(buf)
}

