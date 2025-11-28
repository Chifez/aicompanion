package context

import (
	"context"
)

type contextKey string

var (
	userIDContextKey    contextKey = "userID"
	sessionIDContextKey contextKey = "sessionID"
)

// UserIDFromContext extracts user ID from request context
func UserIDFromContext(ctx context.Context) string {
	if ctx == nil {
		return ""
	}
	if val, ok := ctx.Value(userIDContextKey).(string); ok {
		return val
	}
	return ""
}

// SessionIDFromContext extracts session ID from request context
func SessionIDFromContext(ctx context.Context) string {
	if ctx == nil {
		return ""
	}
	if val, ok := ctx.Value(sessionIDContextKey).(string); ok {
		return val
	}
	return ""
}

// WithUserID adds user ID to the context
func WithUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, userIDContextKey, userID)
}

// WithSessionID adds session ID to the context
func WithSessionID(ctx context.Context, sessionID string) context.Context {
	return context.WithValue(ctx, sessionIDContextKey, sessionID)
}

// WithAuthContext adds both user ID and session ID to the context
func WithAuthContext(ctx context.Context, userID, sessionID string) context.Context {
	ctx = WithUserID(ctx, userID)
	ctx = WithSessionID(ctx, sessionID)
	return ctx
}

