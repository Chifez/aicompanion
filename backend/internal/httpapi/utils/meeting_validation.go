package utils

import (
	"errors"
	"fmt"
	"time"
)

// IsMeetingActionable checks if a meeting can have actions performed on it
// Returns true if meeting is actionable, false if it's ended or past
func IsMeetingActionable(status string, startTime time.Time, durationMinutes int) bool {
	// If meeting is explicitly ended, it's not actionable
	if status == "ended" {
		return false
	}

	// Calculate meeting end time
	endTime := startTime.Add(time.Duration(durationMinutes) * time.Minute)
	now := time.Now()

	// If meeting end time has passed, it's not actionable
	if now.After(endTime) {
		return false
	}

	return true
}

// ValidateMeetingAction checks if an action can be performed on a meeting
func ValidateMeetingAction(status string, startTime time.Time, durationMinutes int) error {
	if !IsMeetingActionable(status, startTime, durationMinutes) {
		endTime := startTime.Add(time.Duration(durationMinutes) * time.Minute)
		if status == "ended" {
			return errors.New("meeting has ended")
		}
		if time.Now().After(endTime) {
			return fmt.Errorf("meeting finished at %s", endTime.Format(time.RFC3339))
		}
		return errors.New("meeting is not actionable")
	}
	return nil
}
