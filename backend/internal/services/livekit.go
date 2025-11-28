package services

import (
	"fmt"
	"time"

	"github.com/livekit/protocol/auth"
)

// GenerateLiveKitToken generates a LiveKit access token for joining a room
func GenerateLiveKitToken(apiKey, apiSecret, userID, userName, roomName string, canPublish, canSubscribe bool) (string, error) {
	if apiKey == "" || apiSecret == "" {
		return "", fmt.Errorf("LiveKit API key and secret must be configured")
	}

	at := auth.NewAccessToken(apiKey, apiSecret)

	grant := &auth.VideoGrant{
		RoomJoin:     true,
		Room:         roomName,
		CanPublish:   &canPublish,
		CanSubscribe: &canSubscribe,
	}

	at.AddGrant(grant).
		SetIdentity(userID).
		SetName(userName).
		SetValidFor(2 * time.Hour)

	return at.ToJWT()
}
