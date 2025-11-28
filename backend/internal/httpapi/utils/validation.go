package utils

import (
	"errors"
	"regexp"
	"strings"
)

var (
	// uuidRegex matches standard UUID format (with or without hyphens)
	uuidRegex = regexp.MustCompile(`^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$`)
	// idRegex matches alphanumeric IDs (more permissive for various ID formats)
	idRegex = regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)
)

// ValidateID validates that an ID parameter is not empty and matches expected format
func ValidateID(id string) error {
	id = strings.TrimSpace(id)
	if id == "" {
		return errors.New("id parameter is required")
	}
	if len(id) > 255 {
		return errors.New("id parameter is too long")
	}
	// Allow UUID format or alphanumeric with dashes/underscores
	if !uuidRegex.MatchString(id) && !idRegex.MatchString(id) {
		return errors.New("id parameter has invalid format")
	}
	return nil
}

// ValidateUUID validates that a string is a valid UUID format
func ValidateUUID(id string) error {
	id = strings.TrimSpace(id)
	if id == "" {
		return errors.New("uuid parameter is required")
	}
	if !uuidRegex.MatchString(id) {
		return errors.New("uuid parameter has invalid format")
	}
	return nil
}
