package services

import (
	"context"
	"fmt"
	"math"
	"strings"

	"github.com/aicomp/ai-virtual-chat/backend/internal/core"
	"github.com/jackc/pgx/v5"
)

// computeSessionHealthMetrics calculates real session health metrics from database
func (s *AppService) computeSessionHealthMetrics(ctx context.Context, userID string) (core.SessionHealthMetrics, error) {
	metrics := core.SessionHealthMetrics{
		ConversationBalance: "0% / 0%",
		AverageLatencyMs:    0,
		FeedbackScore:       0.0,
		Trend:               "neutral",
	}

	// Get user's session IDs from the last 30 days
	var sessionIDs []string
	rows, err := s.db.Query(ctx, `
		SELECT s.id::text
		  FROM sessions s
		  LEFT JOIN meetings m ON m.id = s.meeting_id
		 WHERE (m.host_user_id::text = $1 OR m.host_user_id IS NULL)
		   AND s.started_at >= NOW() - INTERVAL '30 days'`,
		userID,
	)
	if err != nil && err != pgx.ErrNoRows {
		return metrics, err
	}
	if rows != nil {
		defer rows.Close()
		for rows.Next() {
			var sessionID string
			if err := rows.Scan(&sessionID); err == nil {
				sessionIDs = append(sessionIDs, sessionID)
			}
		}
	}

	// If no sessions, return empty metrics (frontend will show empty state)
	if len(sessionIDs) == 0 {
		return metrics, nil
	}

	// 1. COMPUTE CONVERSATION BALANCE from transcript sections
	// Count speaker turns from transcript_sections
	var userTurns, aiTurns int
	var totalTurns int

	// Get transcript IDs for these sessions
	var transcriptIDs []string
	transcriptRows, err := s.db.Query(ctx, `
		SELECT id::text
		  FROM transcripts
		 WHERE session_id::text = ANY($1)`,
		sessionIDs,
	)
	if err == nil && transcriptRows != nil {
		defer transcriptRows.Close()
		for transcriptRows.Next() {
			var transcriptID string
			if err := transcriptRows.Scan(&transcriptID); err == nil {
				transcriptIDs = append(transcriptIDs, transcriptID)
			}
		}
	}

	if len(transcriptIDs) > 0 {
		// Count speaker turns - identify user vs AI speakers
		// Common patterns: "User", "user", "Host", "host" vs "AI", "ai", "Aurora", "Assistant"
		err := s.db.QueryRow(ctx, `
			SELECT 
				COUNT(*) FILTER (WHERE LOWER(speaker) IN ('user', 'host', 'participant')),
				COUNT(*) FILTER (WHERE LOWER(speaker) IN ('ai', 'aurora', 'assistant', 'assistant_ai')),
				COUNT(*)
			  FROM transcript_sections
			 WHERE transcript_id::text = ANY($1)`,
			transcriptIDs,
		).Scan(&userTurns, &aiTurns, &totalTurns)

		if err != nil && err != pgx.ErrNoRows {
			// If query fails, fall back to empty
			userTurns = 0
			aiTurns = 0
			totalTurns = 0
		}
	}

	// Calculate conversation balance percentage
	if totalTurns > 0 {
		userPercent := int(math.Round(float64(userTurns) * 100.0 / float64(totalTurns)))
		aiPercent := int(math.Round(float64(aiTurns) * 100.0 / float64(totalTurns)))
		metrics.ConversationBalance = fmt.Sprintf("%d%% / %d%%", userPercent, aiPercent)
	}

	// 2. COMPUTE AVERAGE LATENCY from transcript timestamps
	// Latency = time between user message and next AI response
	var totalLatencyMs int64
	var latencyCount int

	if len(transcriptIDs) > 0 {
		// Get ordered transcript sections with timestamps
		latencyRows, err := s.db.Query(ctx, `
			SELECT timestamp_ms, speaker
			  FROM transcript_sections
			 WHERE transcript_id::text = ANY($1)
			 ORDER BY transcript_id, timestamp_ms`,
			transcriptIDs,
		)

		if err == nil && latencyRows != nil {
			defer latencyRows.Close()

			var prevTimestamp int
			var isUserTurn bool

			for latencyRows.Next() {
				var timestamp int
				var speaker string
				if err := latencyRows.Scan(&timestamp, &speaker); err != nil {
					continue
				}

				speakerLower := strings.ToLower(speaker)
				currentIsUser := strings.Contains(speakerLower, "user") ||
					strings.Contains(speakerLower, "host") ||
					strings.Contains(speakerLower, "participant")

				// If previous was user and current is AI, calculate latency
				if prevTimestamp > 0 && isUserTurn && !currentIsUser {
					latency := timestamp - prevTimestamp
					if latency > 0 && latency < 300000 { // Reasonable range: 0-5 minutes
						totalLatencyMs += int64(latency)
						latencyCount++
					}
				}

				prevTimestamp = timestamp
				isUserTurn = currentIsUser
			}
		}
	}

	// Calculate average latency in milliseconds
	if latencyCount > 0 {
		metrics.AverageLatencyMs = int(totalLatencyMs / int64(latencyCount))
	}

	// 3. COMPUTE FEEDBACK SCORE from session_feedback table
	var feedbackSum float64
	var feedbackCount int

	err = s.db.QueryRow(ctx, `
		SELECT COALESCE(SUM(rating), 0), COUNT(*)
		  FROM session_feedback sf
		  JOIN sessions s ON s.id = sf.session_id
		  LEFT JOIN meetings m ON m.id = s.meeting_id
		 WHERE (m.host_user_id::text = $1 OR m.host_user_id IS NULL)
		   AND s.started_at >= NOW() - INTERVAL '30 days'`,
		userID,
	).Scan(&feedbackSum, &feedbackCount)

	if err != nil && err != pgx.ErrNoRows {
		// If query fails, use 0
		feedbackSum = 0
		feedbackCount = 0
	}

	// Calculate average feedback score
	if feedbackCount > 0 {
		metrics.FeedbackScore = math.Round(feedbackSum/float64(feedbackCount)*10) / 10 // Round to 1 decimal
	}

	// 4. COMPUTE TREND - compare last 7 days vs previous 7 days
	var sessionsLastWeek, sessionsPreviousWeek int
	_ = s.db.QueryRow(ctx, `
		SELECT COUNT(DISTINCT s.id)
		  FROM sessions s
		  LEFT JOIN meetings m ON m.id = s.meeting_id
		 WHERE (m.host_user_id::text = $1 OR m.host_user_id IS NULL)
		   AND s.started_at >= NOW() - INTERVAL '7 days'`,
		userID,
	).Scan(&sessionsLastWeek)

	_ = s.db.QueryRow(ctx, `
		SELECT COUNT(DISTINCT s.id)
		  FROM sessions s
		  LEFT JOIN meetings m ON m.id = s.meeting_id
		 WHERE (m.host_user_id::text = $1 OR m.host_user_id IS NULL)
		   AND s.started_at >= NOW() - INTERVAL '14 days'
		   AND s.started_at < NOW() - INTERVAL '7 days'`,
		userID,
	).Scan(&sessionsPreviousWeek)

	if sessionsLastWeek > sessionsPreviousWeek {
		metrics.Trend = "up"
	} else if sessionsLastWeek < sessionsPreviousWeek {
		metrics.Trend = "down"
	} else {
		metrics.Trend = "neutral"
	}

	return metrics, nil
}
