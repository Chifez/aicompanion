package utils

import (
	"errors"
	"fmt"
)

// CheckMeetingOwnership verifies that a user owns a meeting
// Returns the host user ID and an error if not owned
func CheckMeetingOwnership(hostUserID, requestingUserID string) error {
	if hostUserID == "" {
		// If no host is set, allow access (legacy meetings)
		return nil
	}
	if requestingUserID == "" {
		return errors.New("user ID is required")
	}
	if hostUserID != requestingUserID {
		return fmt.Errorf("unauthorized: user does not own this meeting")
	}
	return nil
}

// CheckPresetOwnership verifies that a user owns a voice preset
func CheckPresetOwnership(presetUserID, requestingUserID string) error {
	if presetUserID == "" {
		return errors.New("preset user ID is required")
	}
	if requestingUserID == "" {
		return errors.New("user ID is required")
	}
	if presetUserID != requestingUserID {
		return fmt.Errorf("unauthorized: user does not own this preset")
	}
	return nil
}

// CheckTranscriptOwnership verifies that a user owns a transcript
func CheckTranscriptOwnership(transcriptUserID, requestingUserID string) error {
	if transcriptUserID == "" {
		return errors.New("transcript user ID is required")
	}
	if requestingUserID == "" {
		return errors.New("user ID is required")
	}
	if transcriptUserID != requestingUserID {
		return fmt.Errorf("unauthorized: user does not own this transcript")
	}
	return nil
}
