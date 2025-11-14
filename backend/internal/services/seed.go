package services

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Logger interface {
	Printf(format string, v ...any)
	Println(v ...any)
}

const (
	alexID          = "11111111-1111-1111-1111-111111111111"
	jordanID        = "22222222-2222-2222-2222-222222222222"
	mayaID          = "33333333-3333-3333-3333-333333333333"
	meetingID       = "44444444-4444-4444-4444-444444444444"
	sessionOneID    = "55555555-5555-5555-5555-555555555555"
	sessionTwoID    = "66666666-6666-6666-6666-666666666666"
	transcriptOneID = "77777777-7777-7777-7777-777777777777"
	transcriptTwoID = "88888888-8888-8888-8888-888888888888"
	presetAuroraID  = "99999999-9999-9999-9999-999999999999"
	presetNovaID    = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
	seedPasswordHash = "$2a$12$NMS4Hy9KaLgsx3ElJYyhf.7WCs8IYtPZxoMA.BHTTX3e8DqRLVQBm"
)

func Seed(ctx context.Context, pool *pgxpool.Pool, logger Logger) error {
	if pool == nil {
		return nil
	}

	tx, err := pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin seed transaction: %w", err)
	}
	defer tx.Rollback(ctx) // safe to call even after commit

	var count int
	if err := tx.QueryRow(ctx, "SELECT COUNT(*) FROM app_users").Scan(&count); err != nil {
		return fmt.Errorf("count app_users: %w", err)
	}
	if count > 0 {
		if logger != nil {
			logger.Println("seed data already present")
		}
		return tx.Commit(ctx)
	}

	statements := []string{
		fmt.Sprintf(`INSERT INTO app_users (id, email, name, avatar_url, plan_tier, password_hash) VALUES
			('%s', 'alex@example.com', 'Alex Rivera', 'https://avatar.vercel.sh/you', 'pro', '%s'),
			('%s', 'jordan@example.com', 'Jordan Chen', 'https://avatar.vercel.sh/jordan', 'team', '%s'),
			('%s', 'maya@example.com', 'Maya Patel', 'https://avatar.vercel.sh/maya', 'team', '%s')`,
			alexID, seedPasswordHash, jordanID, seedPasswordHash, mayaID, seedPasswordHash),

		fmt.Sprintf(`INSERT INTO user_preferences (user_id, theme_mode, locale, default_voice_id, default_tone, default_energy, notifications_enabled)
			VALUES ('%s', 'dark', 'en-US', 'voice_evelyn', 'Warm', 'Balanced', TRUE)`, alexID),

		`INSERT INTO ai_personas (id, name, voice_preset, tone, energy, description)
			VALUES ('aurora', 'Aurora', 'Evelyn · Warm Alto', 'Warm', 'Balanced', 'Adaptive AI co-host tuned for coaching and focus sessions.')
			ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,

		fmt.Sprintf(`INSERT INTO meetings (id, external_id, title, description, host_user_id, ai_persona_id, start_time, duration_minutes, voice_profile, status)
			VALUES ('%s', 'momentum-checkin', 'Momentum check-in', 'Weekly alignment to unblock the team and tune AI co-host energy.',
			        '%s', 'aurora', NOW() + INTERVAL '1 day', 45, 'Evelyn · Warm Alto', 'scheduled')`,
			meetingID, alexID),

		fmt.Sprintf(`INSERT INTO meeting_participants (meeting_id, user_id, display_name, role, avatar_url, joined_at)
			VALUES
				('%s', '%s', 'Alex Rivera', 'Host', 'https://avatar.vercel.sh/you', NOW()),
				('%s', '%s', 'Jordan Chen', 'Product Lead', 'https://avatar.vercel.sh/jordan', NULL)`,
			meetingID, alexID, meetingID, jordanID),

		fmt.Sprintf(`INSERT INTO meeting_agenda_items (id, meeting_id, order_index, title, description, duration_minutes)
			VALUES
				(gen_random_uuid(), '%s', 1, 'Energy pulse', 'Quick read on team momentum', 10),
				(gen_random_uuid(), '%s', 2, 'Deep dive', 'Aurora surfaces insights from the last sprint', 20),
				(gen_random_uuid(), '%s', 3, 'Commitments', 'Action items and accountability', 15)`,
			meetingID, meetingID, meetingID),

		fmt.Sprintf(`INSERT INTO sessions (id, meeting_id, title, focus, started_at, duration_minutes, sentiment, action_summary)
			VALUES
				('%s', '%s', 'Product vision sync', 'Narrative alignment', NOW() - INTERVAL '26 hours', 52, 'Positive', '3 follow-ups assigned'),
				('%s', '%s', 'Weekly momentum', 'Team alignment', NOW() - INTERVAL '4 days', 45, 'Neutral', '2 blockers resolved')`,
			sessionOneID, meetingID, sessionTwoID, meetingID),

		fmt.Sprintf(`INSERT INTO transcripts (id, session_id, storage_path, raw_content, language, confidence)
			VALUES
				('%s', '%s', NULL, NULL, 'en', 0.78),
				('%s', '%s', NULL, NULL, 'en', 0.55)`,
			transcriptOneID, sessionOneID, transcriptTwoID, sessionTwoID),

		fmt.Sprintf(`INSERT INTO transcript_sections (id, transcript_id, timestamp_ms, speaker, text)
			VALUES
				(gen_random_uuid(), '%s', 15000, 'Alex', 'Great to see everyone—Aurora, can you pull up last week''s wins?'),
				(gen_random_uuid(), '%s', 60000, 'Aurora', 'Two highlights stood out: the activation experiment and the narrative test with beta users.'),
				(gen_random_uuid(), '%s', 195000, 'Jordan', 'I''ll take the onboarding script and tune it to the new narrative.'),
				(gen_random_uuid(), '%s', 20000, 'Aurora', 'Momentum score dipped 8%% this week—here''s the likely cause.'),
				(gen_random_uuid(), '%s', 110000, 'Alex', 'Let''s get infra looped so this doesn''t slow next week''s ship.')`,
			transcriptOneID, transcriptOneID, transcriptOneID, transcriptTwoID, transcriptTwoID),

		fmt.Sprintf(`INSERT INTO transcript_highlights (id, transcript_id, timestamp_ms, speaker, summary, action_item)
			VALUES
				(gen_random_uuid(), '%s', 120000, 'Aurora', 'Clarified the customer narrative in 2 sentences.', FALSE),
				(gen_random_uuid(), '%s', 198000, 'Jordan', 'Committed to prototype the revised onboarding.', TRUE),
				(gen_random_uuid(), '%s', 90000, 'Aurora', 'Flagged two blockers slowing experimentation.', TRUE)`,
			transcriptOneID, transcriptOneID, transcriptTwoID),

		fmt.Sprintf(`INSERT INTO voice_presets (id, user_id, name, voice_id, tone, energy, description, sample_url, is_default)
			VALUES
				('%s', '%s', 'Evelyn · Warm Alto', 'voice_evelyn', 'Warm', 'Balanced', 'Default aurora voice tuned for coaching.', 'https://audio.example.com/evelyn-preview.mp3', TRUE),
				('%s', '%s', 'Nova · Energetic Soprano', 'voice_nova', 'Encouraging', 'High', 'High-energy persona for daily standups.', 'https://audio.example.com/nova-preview.mp3', FALSE)`,
			presetAuroraID, alexID, presetNovaID, alexID),
	}

	for _, stmt := range statements {
		if _, err := tx.Exec(ctx, stmt); err != nil {
			return fmt.Errorf("seed execute statement: %w", err)
		}
	}

	if logger != nil {
		logger.Println("seed data inserted")
	}

	return tx.Commit(ctx)
}
