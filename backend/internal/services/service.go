package services

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/aicomp/ai-virtual-chat/backend/internal/core"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type AppService struct {
	db *pgxpool.Pool
}

func NewAppService(db *pgxpool.Pool) *AppService {
	return &AppService{db: db}
}

const (
	accessTokenTTL  = 15 * time.Minute
	refreshTokenTTL = 7 * 24 * time.Hour
)

func generateRandomHex(bytesLen int) (string, error) {
	buf := make([]byte, bytesLen)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return hex.EncodeToString(buf), nil
}

func hashRefreshToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

func (s *AppService) ensureDB() error {
	if s.db == nil {
		return fmt.Errorf("database connection not available")
	}
	return nil
}

func (s *AppService) firstUserID(ctx context.Context) (string, error) {
	var id string
	if err := s.db.QueryRow(ctx, `SELECT id::text FROM app_users ORDER BY created_at LIMIT 1`).Scan(&id); err != nil {
		if err == pgx.ErrNoRows {
			return "", fmt.Errorf("no users found")
		}
		return "", err
	}
	return id, nil
}

func (s *AppService) GetAuthSession(ctx context.Context, userID string) (*core.AuthSessionResponse, error) {
	if err := s.ensureDB(); err != nil {
		return nil, err
	}

	if strings.TrimSpace(userID) == "" {
		var err error
		userID, err = s.firstUserID(ctx)
		if err != nil {
			return nil, err
		}
	}

	row := s.db.QueryRow(ctx, `
		SELECT u.id::text,
			   u.name,
			   u.email,
			   COALESCE(u.avatar_url, ''),
			   u.plan_tier,
			   COALESCE(p.theme_mode, 'dark'),
			   COALESCE(p.locale, 'en-US'),
			   COALESCE(p.default_voice_id, ''),
			   COALESCE(p.default_tone, ''),
			   COALESCE(p.default_energy, ''),
			   COALESCE(p.notifications_enabled, TRUE)
		  FROM app_users u
		  LEFT JOIN user_preferences p ON p.user_id = u.id
		 WHERE u.id::text = $1
		 LIMIT 1`, userID)

	var resp core.AuthSessionResponse
	if err := row.Scan(
		&resp.User.ID,
		&resp.User.Name,
		&resp.User.Email,
		&resp.User.AvatarURL,
		&resp.User.PlanTier,
		&resp.Preferences.ThemeMode,
		&resp.Preferences.Locale,
		&resp.Preferences.DefaultVoiceID,
		&resp.Preferences.DefaultTone,
		&resp.Preferences.DefaultEnergy,
		&resp.Preferences.NotificationsOpt,
	); err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}

	resp.Features = map[string]bool{
		"realtime":       true,
		"voice_cloning":  true,
		"advanced_notes": true,
	}

	var seatCount int64
	_ = s.db.QueryRow(ctx, `SELECT COUNT(*) FROM app_users`).Scan(&seatCount)
	if seatCount == 0 {
		seatCount = 1
	}
	resp.Audience = map[string]int64{
		"activeSeats": seatCount,
		"workspaces":  1,
	}

	return &resp, nil
}

func (s *AppService) AuthenticateUser(ctx context.Context, email string, password string) (*core.AuthSessionResponse, error) {
	if err := s.ensureDB(); err != nil {
		return nil, err
	}

	email = strings.TrimSpace(strings.ToLower(email))
	password = strings.TrimSpace(password)

	if email == "" {
		return nil, fmt.Errorf("email is required")
	}
	if password == "" {
		return nil, fmt.Errorf("password is required")
	}

	var userID string
	var passwordHash string
	if err := s.db.QueryRow(ctx, `
		SELECT id::text, COALESCE(password_hash, '')
		  FROM app_users
		 WHERE LOWER(email) = $1
		 LIMIT 1`, email).Scan(&userID, &passwordHash); err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("invalid credentials")
		}
		return nil, err
	}

	if passwordHash == "" {
		return nil, fmt.Errorf("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(password)); err != nil {
		return nil, fmt.Errorf("invalid credentials")
	}

	return s.GetAuthSession(ctx, userID)
}

func (s *AppService) RegisterUser(ctx context.Context, req core.AuthRegisterRequest) (*core.AuthSessionResponse, error) {
	if err := s.ensureDB(); err != nil {
		return nil, err
	}

	name := strings.TrimSpace(req.Name)
	email := strings.TrimSpace(strings.ToLower(req.Email))
	password := strings.TrimSpace(req.Password)

	if name == "" {
		return nil, fmt.Errorf("name is required")
	}
	if email == "" {
		return nil, fmt.Errorf("email is required")
	}
	if password == "" {
		return nil, fmt.Errorf("password is required")
	}
	if len(password) < 8 {
		return nil, fmt.Errorf("password must be at least 8 characters long")
	}

	hashBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password")
	}

	var userID string
	if err := s.db.QueryRow(ctx, `
		INSERT INTO app_users (email, name, avatar_url, plan_tier, password_hash)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id::text`,
		email,
		name,
		"",
		"free",
		string(hashBytes),
	).Scan(&userID); err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "duplicate") {
			return nil, fmt.Errorf("email already exists")
		}
		return nil, err
	}

	if _, err := s.db.Exec(ctx, `
		INSERT INTO user_preferences (user_id)
		VALUES ($1::uuid)
		ON CONFLICT (user_id) DO NOTHING`,
		userID,
	); err != nil {
		return nil, err
	}

	return s.GetAuthSession(ctx, userID)
}

func (s *AppService) CreateSession(ctx context.Context, userID string) (string, string, time.Time, error) {
	if err := s.ensureDB(); err != nil {
		return "", "", time.Time{}, err
	}

	userID = strings.TrimSpace(userID)
	if userID == "" {
		return "", "", time.Time{}, fmt.Errorf("user id is required")
	}

	refreshToken, err := generateRandomHex(32)
	if err != nil {
		return "", "", time.Time{}, err
	}

	refreshHash := hashRefreshToken(refreshToken)
	expiresAt := time.Now().Add(refreshTokenTTL)

	var sessionID string
	if err := s.db.QueryRow(ctx, `
		INSERT INTO session_tokens (user_id, refresh_token_hash, expires_at)
		VALUES ($1::uuid, $2, $3)
		RETURNING id::text`,
		userID,
		refreshHash,
		expiresAt,
	).Scan(&sessionID); err != nil {
		return "", "", time.Time{}, err
	}

	return sessionID, refreshToken, expiresAt, nil
}

func (s *AppService) RefreshSession(ctx context.Context, refreshToken string) (string, string, time.Time, string, error) {
	if err := s.ensureDB(); err != nil {
		return "", "", time.Time{}, "", err
	}

	refreshToken = strings.TrimSpace(refreshToken)
	if refreshToken == "" {
		return "", "", time.Time{}, "", fmt.Errorf("refresh token is required")
	}

	refreshHash := hashRefreshToken(refreshToken)

	var (
		sessionID string
		userID    string
		expiresAt time.Time
		revoked   bool
	)

	err := s.db.QueryRow(ctx, `
		SELECT id::text, user_id::text, expires_at, revoked
		  FROM session_tokens
		 WHERE refresh_token_hash = $1
		 LIMIT 1`,
		refreshHash,
	).Scan(&sessionID, &userID, &expiresAt, &revoked)
	if err != nil {
		if err == pgx.ErrNoRows {
			return "", "", time.Time{}, "", fmt.Errorf("invalid refresh token")
		}
		return "", "", time.Time{}, "", err
	}

	if revoked || expiresAt.Before(time.Now()) {
		_, _ = s.db.Exec(ctx, `
			UPDATE session_tokens
			   SET revoked = TRUE
			 WHERE id::uuid = $1`, sessionID)
		return "", "", time.Time{}, "", fmt.Errorf("invalid refresh token")
	}

	newRefreshToken, err := generateRandomHex(32)
	if err != nil {
		return "", "", time.Time{}, "", err
	}

	newHash := hashRefreshToken(newRefreshToken)
	newExpires := time.Now().Add(refreshTokenTTL)

	if _, err := s.db.Exec(ctx, `
		UPDATE session_tokens
		   SET refresh_token_hash = $1,
		       expires_at = $2,
		       revoked = FALSE
		 WHERE id::uuid = $3`,
		newHash,
		newExpires,
		sessionID,
	); err != nil {
		return "", "", time.Time{}, "", err
	}

	return sessionID, newRefreshToken, newExpires, userID, nil
}

func (s *AppService) RevokeSession(ctx context.Context, sessionID string) error {
	if err := s.ensureDB(); err != nil {
		return err
	}

	sessionID = strings.TrimSpace(sessionID)
	if sessionID == "" {
		return fmt.Errorf("session id is required")
	}

	result, err := s.db.Exec(ctx, `
		UPDATE session_tokens
		   SET revoked = TRUE
		 WHERE id::uuid = $1`, sessionID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("session not found")
	}
	return nil
}

func (s *AppService) ValidateSession(ctx context.Context, sessionID string) (string, error) {
	if err := s.ensureDB(); err != nil {
		return "", err
	}

	sessionID = strings.TrimSpace(sessionID)
	if sessionID == "" {
		return "", fmt.Errorf("session id is required")
	}

	var (
		userID    string
		expiresAt time.Time
		revoked   bool
	)

	err := s.db.QueryRow(ctx, `
		SELECT user_id::text, expires_at, revoked
		  FROM session_tokens
		 WHERE id::uuid = $1
		 LIMIT 1`,
		sessionID,
	).Scan(&userID, &expiresAt, &revoked)
	if err != nil {
		if err == pgx.ErrNoRows {
			return "", fmt.Errorf("session not found")
		}
		return "", err
	}

	if revoked {
		return "", fmt.Errorf("session revoked")
	}

	if expiresAt.Before(time.Now()) {
		return "", fmt.Errorf("session expired")
	}

	return userID, nil
}

func (s *AppService) GetDashboardOverview(ctx context.Context) (*core.DashboardOverviewResponse, error) {
	if err := s.ensureDB(); err != nil {
		return nil, err
	}

	overview := core.DashboardOverviewResponse{}

	var (
		sessionID string
		title     string
		focus     string
		startedAt time.Time
		duration  int
		sentiment string
		action    string
	)

	err := s.db.QueryRow(ctx, `
		SELECT id::text,
			   title,
			   COALESCE(focus, ''),
			   started_at,
			   duration_minutes,
			   COALESCE(sentiment, ''),
			   COALESCE(action_summary, '')
		  FROM sessions
		 ORDER BY started_at DESC
		 LIMIT 1`).Scan(&sessionID, &title, &focus, &startedAt, &duration, &sentiment, &action)

	if err == nil {
		overview.Spotlight = core.DashboardSpotlight{
			Quote:        action,
			Conversation: title,
		}
		_ = s.db.QueryRow(ctx, `SELECT id::text FROM transcripts WHERE session_id::text = $1 LIMIT 1`, sessionID).Scan(&overview.Spotlight.TranscriptID)
	}

	overview.UpcomingFocus = core.DashboardUpcomingFocus{
		FocusArea: "Quarterly momentum check-in",
		StartTime: s.nextMeetingStart(ctx),
		Duration:  45,
	}

	overview.Streak = s.sessionStreak(ctx)
	overview.InsightMetrics = s.dashboardMetrics(ctx)
	overview.RecentSessions = s.recentSessions(ctx)

	return &overview, nil
}

func (s *AppService) nextMeetingStart(ctx context.Context) time.Time {
	var ts time.Time
	if err := s.db.QueryRow(ctx, `
		SELECT start_time
		  FROM meetings
		 WHERE start_time >= NOW()
		 ORDER BY start_time
		 LIMIT 1`).Scan(&ts); err != nil || ts.IsZero() {
		return time.Now().Add(6 * time.Hour)
	}
	return ts
}

func (s *AppService) sessionStreak(ctx context.Context) core.DashboardStreak {
	var total, thisWeek int
	_ = s.db.QueryRow(ctx, `SELECT COUNT(*) FROM sessions`).Scan(&total)
	_ = s.db.QueryRow(ctx, `SELECT COUNT(*) FROM sessions WHERE started_at >= NOW() - INTERVAL '7 days'`).Scan(&thisWeek)
	if total == 0 {
		total = 1
	}
	if thisWeek == 0 {
		thisWeek = 1
	}
	return core.DashboardStreak{Current: thisWeek, Longest: total}
}

func (s *AppService) dashboardMetrics(ctx context.Context) []core.InsightMetric {
	var sessionCount, highlightCount int
	_ = s.db.QueryRow(ctx, `SELECT COUNT(*) FROM sessions`).Scan(&sessionCount)
	_ = s.db.QueryRow(ctx, `SELECT COUNT(*) FROM transcript_highlights`).Scan(&highlightCount)

	return []core.InsightMetric{
		{ID: "sentiment", Label: "Sessions captured", Value: fmt.Sprintf("%d sessions", sessionCount), Delta: 12, Direction: "up"},
		{ID: "context", Label: "Transcript insights", Value: fmt.Sprintf("%d highlights", highlightCount), Delta: 5, Direction: "up"},
		{ID: "actions", Label: "Action follow-through", Value: "86%", Delta: -3, Direction: "down"},
	}
}

func (s *AppService) recentSessions(ctx context.Context) []core.SessionSummary {
	rows, err := s.db.Query(ctx, `
		SELECT s.id::text,
			   s.title,
			   COALESCE(s.focus, ''),
			   s.started_at,
			   s.duration_minutes,
			   COALESCE(s.sentiment, ''),
			   COALESCE(s.action_summary, ''),
			   COALESCE(string_agg(DISTINCT mp.display_name, ',' ORDER BY mp.display_name), ''),
			   COALESCE((SELECT id::text FROM transcripts WHERE session_id = s.id LIMIT 1), '')
		  FROM sessions s
		  LEFT JOIN meetings m ON m.id = s.meeting_id
		  LEFT JOIN meeting_participants mp ON mp.meeting_id = m.id
		 GROUP BY s.id
		 ORDER BY s.started_at DESC
		 LIMIT 4`)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var sessions []core.SessionSummary
	for rows.Next() {
		var participantsCSV string
		var summary core.SessionSummary
		if err := rows.Scan(
			&summary.ID,
			&summary.Title,
			&summary.Focus,
			&summary.StartedAt,
			&summary.DurationMins,
			&summary.Sentiment,
			&summary.ActionSummary,
			&participantsCSV,
			&summary.TranscriptID,
		); err == nil {
			summary.Participants = splitCSV(participantsCSV)
			sessions = append(sessions, summary)
		}
	}
	return sessions
}

func (s *AppService) ListMeetings(ctx context.Context) (*core.MeetingsResponse, error) {
	if err := s.ensureDB(); err != nil {
		return nil, err
	}

	rows, err := s.db.Query(ctx, `
		SELECT COALESCE(external_id, id::text),
			   title,
			   COALESCE(description, ''),
			   start_time,
			   duration_minutes,
			   COALESCE(voice_profile, ''),
			   status
		  FROM meetings
		 ORDER BY start_time`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	resp := &core.MeetingsResponse{
		SessionHealth: core.SessionHealthMetrics{
			ConversationBalance: "58% / 42%",
			AverageLatencyMs:    210,
			FeedbackScore:       4.6,
			Trend:               "up",
		},
		QuickStartTemplates: []core.QuickStartTemplate{
			{ID: "template-retro", Title: "Retro reboot", Description: "Re-energize your retros with AI prompts.", Badge: "Popular"},
			{ID: "template-product", Title: "Product narrative", Description: "Pressure-test the story before investor updates.", Badge: "AI guided"},
			{ID: "template-onboarding", Title: "Onboarding accelerator", Description: "Give new hires a personal AI co-pilot.", Badge: "New"},
		},
	}

	for rows.Next() {
		var item core.MeetingSummary
		if err := rows.Scan(
			&item.ID,
			&item.Title,
			&item.Description,
			&item.StartTime,
			&item.DurationMinutes,
			&item.VoiceProfile,
			&item.Status,
		); err == nil {
			resp.Scheduled = append(resp.Scheduled, item)
		}
	}

	return resp, nil
}

func (s *AppService) GetMeeting(ctx context.Context, slug string) (*core.MeetingDetail, error) {
	if err := s.ensureDB(); err != nil {
		return nil, err
	}

	var detail core.MeetingDetail
	var meetingID string

	err := s.db.QueryRow(ctx, `
		SELECT id::text,
			   COALESCE(external_id, id::text),
			   title,
			   COALESCE(description, ''),
			   start_time,
			   duration_minutes,
			   COALESCE(voice_profile, ''),
			   status,
			   COALESCE(ai_persona_id, 'aurora')
		  FROM meetings
		 WHERE COALESCE(external_id, id::text) = $1
		 LIMIT 1`, slug).Scan(
		&meetingID,
		&detail.Summary.ID,
		&detail.Summary.Title,
		&detail.Summary.Description,
		&detail.Summary.StartTime,
		&detail.Summary.DurationMinutes,
		&detail.Summary.VoiceProfile,
		&detail.Summary.Status,
		&detail.AiPersona.ID,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("meeting not found")
		}
		return nil, err
	}

	if err := s.db.QueryRow(ctx, `
		SELECT name, voice_preset, tone, energy, COALESCE(description, '')
		  FROM ai_personas
		 WHERE id = $1`, detail.AiPersona.ID).Scan(
		&detail.AiPersona.Name,
		&detail.AiPersona.VoicePreset,
		&detail.AiPersona.Tone,
		&detail.AiPersona.Energy,
		&detail.AiPersona.Description,
	); err == pgx.ErrNoRows {
		detail.AiPersona = core.AiPersona{
			ID:          "aurora",
			Name:        "Aurora",
			VoicePreset: detail.Summary.VoiceProfile,
			Tone:        "Warm",
			Energy:      "Balanced",
			Description: "Adaptive co-host tuned for coaching and focus sessions.",
		}
	}

	agendaRows, err := s.db.Query(ctx, `
		SELECT id::text, title, COALESCE(description, ''), duration_minutes
		  FROM meeting_agenda_items
		 WHERE meeting_id::text = $1
		 ORDER BY order_index`, meetingID)
	if err == nil {
		defer agendaRows.Close()
		for agendaRows.Next() {
			var item core.AgendaItem
			if err := agendaRows.Scan(&item.ID, &item.Title, &item.Description, &item.Duration); err == nil {
				detail.Agenda = append(detail.Agenda, item)
			}
		}
	}

	participantRows, err := s.db.Query(ctx, `
		SELECT COALESCE(user_id::text, ''), display_name, role, COALESCE(avatar_url, '')
		  FROM meeting_participants
		 WHERE meeting_id::text = $1
		 ORDER BY display_name`, meetingID)
	if err == nil {
		defer participantRows.Close()
		for participantRows.Next() {
			var p core.MeetingParticipant
			if err := participantRows.Scan(&p.ID, &p.Name, &p.Role, &p.AvatarURL); err == nil {
				detail.Participants = append(detail.Participants, p)
			}
		}
	}

	detail.Resources = []core.ResourceLink{
		{Title: "Team scorecard", URL: "https://example.com/scorecard", Type: "notion"},
		{Title: "Quarterly goals", URL: "https://example.com/goals", Type: "google-doc"},
	}
	detail.Notes = "Aurora will prompt on blockers around retention experiments."

	return detailClone(detail), nil
}

func detailClone(detail core.MeetingDetail) *core.MeetingDetail {
	copyDetail := detail
	copyDetail.Agenda = append([]core.AgendaItem(nil), detail.Agenda...)
	copyDetail.Participants = append([]core.MeetingParticipant(nil), detail.Participants...)
	copyDetail.Resources = append([]core.ResourceLink(nil), detail.Resources...)
	return &copyDetail
}

func (s *AppService) ListTranscripts(ctx context.Context) (*core.TranscriptListResponse, error) {
	if err := s.ensureDB(); err != nil {
		return nil, err
	}

	rows, err := s.db.Query(ctx, `
		SELECT t.id::text,
			   s.title,
			   t.created_at,
			   s.duration_minutes,
			   COALESCE(t.confidence, 0),
			   COALESCE(string_agg(DISTINCT mp.display_name, ',' ORDER BY mp.display_name), '')
		  FROM transcripts t
		  JOIN sessions s ON s.id = t.session_id
		  LEFT JOIN meetings m ON m.id = s.meeting_id
		  LEFT JOIN meeting_participants mp ON mp.meeting_id = m.id
		 GROUP BY t.id, s.title, t.created_at, s.duration_minutes, t.confidence
		 ORDER BY t.created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	resp := &core.TranscriptListResponse{}
	for rows.Next() {
		var item core.TranscriptSummary
		var keywordsCSV string
		if err := rows.Scan(
			&item.ID,
			&item.Title,
			&item.CreatedAt,
			&item.DurationMinutes,
			&item.SentimentScore,
			&keywordsCSV,
		); err == nil {
			item.Keywords = splitCSV(keywordsCSV)
			resp.Transcripts = append(resp.Transcripts, item)
		}
	}

	return resp, nil
}

func (s *AppService) GetTranscript(ctx context.Context, transcriptID string) (*core.TranscriptDetailResponse, error) {
	if err := s.ensureDB(); err != nil {
		return nil, err
	}

	var detail core.TranscriptDetailResponse
	if err := s.db.QueryRow(ctx, `
		SELECT t.id::text,
			   s.title,
			   t.created_at,
			   s.duration_minutes,
			   COALESCE(t.confidence, 0)
		  FROM transcripts t
		  JOIN sessions s ON s.id = t.session_id
		 WHERE t.id::text = $1
		 LIMIT 1`, transcriptID).Scan(
		&detail.Transcript.Summary.ID,
		&detail.Transcript.Summary.Title,
		&detail.Transcript.Summary.CreatedAt,
		&detail.Transcript.Summary.DurationMinutes,
		&detail.Transcript.Summary.SentimentScore,
	); err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("transcript not found")
		}
		return nil, err
	}

	sections, err := s.db.Query(ctx, `
		SELECT timestamp_ms, speaker, text
		  FROM transcript_sections
		 WHERE transcript_id::text = $1
		 ORDER BY timestamp_ms`, transcriptID)
	if err == nil {
		defer sections.Close()
		for sections.Next() {
			var section core.TranscriptSection
			if err := sections.Scan(&section.TimestampMs, &section.Speaker, &section.Text); err == nil {
				detail.Transcript.Sections = append(detail.Transcript.Sections, section)
			}
		}
	}

	highlights, err := s.db.Query(ctx, `
		SELECT timestamp_ms, speaker, summary, action_item
		  FROM transcript_highlights
		 WHERE transcript_id::text = $1
		 ORDER BY timestamp_ms`, transcriptID)
	if err == nil {
		defer highlights.Close()
		var actionItems []string
		for highlights.Next() {
			var h core.TranscriptHighlight
			var action bool
			if err := highlights.Scan(&h.TimestampMs, &h.Speaker, &h.Summary, &action); err == nil {
				detail.Transcript.Highlights = append(detail.Transcript.Highlights, h)
				if action {
					actionItems = append(actionItems, h.Summary)
				}
			}
		}
		detail.Transcript.ActionItems = actionItems
	}

	return &detail, nil
}

func (s *AppService) GetSettings(ctx context.Context, userID string) (*core.SettingsResponse, error) {
	if err := s.ensureDB(); err != nil {
		return nil, err
	}

	userID = strings.TrimSpace(userID)

	if userID == "" {
		var err error
		userID, err = s.firstUserID(ctx)
		if err != nil {
			return nil, err
		}
	}

	resp := &core.SettingsResponse{}
	if err := s.db.QueryRow(ctx, `
		SELECT name, 'Product Lead', COALESCE(avatar_url, '')
		  FROM app_users WHERE id::text = $1`, userID).Scan(
		&resp.Profile.DisplayName,
		&resp.Profile.Role,
		&resp.Profile.AvatarURL,
	); err != nil {
		return nil, err
	}

	_ = s.db.QueryRow(ctx, `
		SELECT id, name, voice_preset, tone, energy, COALESCE(description, '')
		  FROM ai_personas WHERE id = 'aurora'`).Scan(
		&resp.Personality.PersonaID,
		&resp.Personality.PersonaName,
		&resp.Personality.VoicePreset,
		&resp.Personality.Tone,
		&resp.Personality.Energy,
		&resp.Personality.Summary,
	)

	if strings.TrimSpace(resp.Personality.Tone) == "" {
		resp.Personality.Tone = "Warm"
	}
	if strings.TrimSpace(resp.Personality.Energy) == "" {
		resp.Personality.Energy = "Balanced"
	}

	resp.Privacy.RecordingEnabled = true
	resp.Privacy.DataRetentionDays = 30
	resp.Privacy.AllowModelTraining = false

	if err := s.db.QueryRow(ctx, `
		SELECT COALESCE(default_tone, 'Warm'),
			   COALESCE(default_energy, 'Balanced'),
			   COALESCE(recording_enabled, TRUE),
			   COALESCE(data_retention_days, 30),
			   COALESCE(allow_model_training, FALSE)
		  FROM user_preferences
		 WHERE user_id::text = $1`, userID).Scan(
		&resp.Personality.Tone,
		&resp.Personality.Energy,
		&resp.Privacy.RecordingEnabled,
		&resp.Privacy.DataRetentionDays,
		&resp.Privacy.AllowModelTraining,
	); err != nil {
		// keep defaults if preferences row missing
	}

	return resp, nil
}

func (s *AppService) ListVoicePresets(ctx context.Context, userID string) (*core.VoicePresetsResponse, error) {
	if err := s.ensureDB(); err != nil {
		return nil, err
	}

	userID = strings.TrimSpace(userID)

	if userID == "" {
		var err error
		userID, err = s.firstUserID(ctx)
		if err != nil {
			return nil, err
		}
	}

	rows, err := s.db.Query(ctx, `
		SELECT id::text, name, voice_id, COALESCE(tone, ''), COALESCE(energy, ''), COALESCE(description, ''), COALESCE(sample_url, ''), is_default
		  FROM voice_presets
		 WHERE user_id::text = $1
		 ORDER BY is_default DESC, created_at`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	resp := &core.VoicePresetsResponse{}
	for rows.Next() {
		var preset core.VoicePreset
		if err := rows.Scan(
			&preset.ID,
			&preset.Name,
			&preset.VoiceID,
			&preset.Tone,
			&preset.Energy,
			&preset.Description,
			&preset.SampleURL,
			&preset.IsDefault,
		); err == nil {
			resp.Presets = append(resp.Presets, preset)
		}
	}

	if len(resp.Presets) == 0 {
		resp.Presets = []core.VoicePreset{
			{ID: "preset-aurora", Name: "Evelyn · Warm Alto", VoiceID: "voice_evelyn", Tone: "Warm", Energy: "Balanced", Description: "Default aurora voice tuned for coaching.", SampleURL: "", IsDefault: true},
		}
	}

	return resp, nil
}

// Write-side methods will be implemented in the next steps.

func (s *AppService) CreateMeeting(ctx context.Context, req core.MeetingCreateRequest, userID string) (*core.MeetingDetail, error) {
	if err := s.ensureDB(); err != nil {
		return nil, err
	}

	userID = strings.TrimSpace(userID)

	if strings.TrimSpace(req.Title) == "" {
		return nil, fmt.Errorf("title is required")
	}
	if req.StartTime.IsZero() {
		return nil, fmt.Errorf("startTime is required")
	}
	if req.DurationMinutes <= 0 {
		req.DurationMinutes = 30
	}

	if userID == "" {
		var err error
		userID, err = s.firstUserID(ctx)
		if err != nil {
			return nil, err
		}
	}

	personaID := req.AiPersonaID
	if strings.TrimSpace(personaID) == "" {
		personaID = "aurora"
	}

	externalID := generateMeetingExternalID(req.Title)

	tx, err := s.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var meetingID, slug string
	if err := tx.QueryRow(ctx, `
		INSERT INTO meetings (external_id, title, description, host_user_id, ai_persona_id, start_time, duration_minutes, voice_profile, status)
		VALUES ($1, $2, $3, $4::uuid, $5, $6, $7, $8, 'scheduled')
		RETURNING id::text, COALESCE(external_id, id::text)`,
		externalID,
		strings.TrimSpace(req.Title),
		strings.TrimSpace(req.Description),
		userID,
		personaID,
		req.StartTime,
		req.DurationMinutes,
		strings.TrimSpace(req.VoiceProfile),
	).Scan(&meetingID, &slug); err != nil {
		return nil, err
	}

	for idx, item := range req.Agenda {
		if strings.TrimSpace(item.Title) == "" {
			continue
		}
		duration := item.Duration
		if duration < 0 {
			duration = 0
		}
		if _, err := tx.Exec(ctx, `
			INSERT INTO meeting_agenda_items (meeting_id, order_index, title, description, duration_minutes)
			VALUES ($1::uuid, $2, $3, $4, $5)`,
			meetingID,
			idx+1,
			strings.TrimSpace(item.Title),
			strings.TrimSpace(item.Description),
			duration,
		); err != nil {
			return nil, err
		}
	}

	var hostName, hostAvatar string
	if err := tx.QueryRow(ctx, `
		SELECT name, COALESCE(avatar_url, '')
		  FROM app_users
		 WHERE id::text = $1
		 LIMIT 1`, userID).Scan(&hostName, &hostAvatar); err == nil && strings.TrimSpace(hostName) != "" {
		if _, err := tx.Exec(ctx, `
			INSERT INTO meeting_participants (meeting_id, user_id, display_name, role, avatar_url, joined_at)
			VALUES ($1::uuid, $2::uuid, $3, $4, $5, NULL)
			ON CONFLICT (meeting_id, display_name) DO NOTHING`,
			meetingID,
			userID,
			hostName,
			"Host",
			hostAvatar,
		); err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return s.GetMeeting(ctx, slug)
}

func (s *AppService) UpdateMeeting(ctx context.Context, identifier string, req core.MeetingUpdateRequest) (*core.MeetingDetail, error) {
	if err := s.ensureDB(); err != nil {
		return nil, err
	}
	if strings.TrimSpace(identifier) == "" {
		return nil, fmt.Errorf("meeting identifier is required")
	}

	tx, err := s.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var meetingID, slug string
	if err := tx.QueryRow(ctx, `
		SELECT id::text, COALESCE(external_id, id::text)
		  FROM meetings
		 WHERE COALESCE(external_id, id::text) = $1
		 FOR UPDATE`,
		identifier,
	).Scan(&meetingID, &slug); err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("meeting not found")
		}
		return nil, err
	}

	setClauses := make([]string, 0, 6)
	args := make([]any, 0, 6)

	if req.Title != nil && strings.TrimSpace(*req.Title) != "" {
		setClauses = append(setClauses, fmt.Sprintf("title = $%d", len(args)+1))
		args = append(args, strings.TrimSpace(*req.Title))
	}
	if req.Description != nil {
		setClauses = append(setClauses, fmt.Sprintf("description = $%d", len(args)+1))
		args = append(args, strings.TrimSpace(*req.Description))
	}
	if req.StartTime != nil && !req.StartTime.IsZero() {
		setClauses = append(setClauses, fmt.Sprintf("start_time = $%d", len(args)+1))
		args = append(args, *req.StartTime)
	}
	if req.DurationMinutes != nil && *req.DurationMinutes > 0 {
		setClauses = append(setClauses, fmt.Sprintf("duration_minutes = $%d", len(args)+1))
		args = append(args, *req.DurationMinutes)
	}
	if req.VoiceProfile != nil {
		setClauses = append(setClauses, fmt.Sprintf("voice_profile = $%d", len(args)+1))
		args = append(args, strings.TrimSpace(*req.VoiceProfile))
	}
	if req.AiPersonaID != nil && strings.TrimSpace(*req.AiPersonaID) != "" {
		setClauses = append(setClauses, fmt.Sprintf("ai_persona_id = $%d", len(args)+1))
		args = append(args, strings.TrimSpace(*req.AiPersonaID))
	}

	if len(setClauses) > 0 {
		setClauses = append(setClauses, "updated_at = NOW()")
		args = append(args, meetingID)
		query := fmt.Sprintf("UPDATE meetings SET %s WHERE id::text = $%d", strings.Join(setClauses, ", "), len(args))
		if _, err := tx.Exec(ctx, query, args...); err != nil {
			return nil, err
		}
	} else if req.Agenda != nil {
		if _, err := tx.Exec(ctx, `UPDATE meetings SET updated_at = NOW() WHERE id::text = $1`, meetingID); err != nil {
			return nil, err
		}
	}

	if req.Agenda != nil {
		if _, err := tx.Exec(ctx, `DELETE FROM meeting_agenda_items WHERE meeting_id::text = $1`, meetingID); err != nil {
			return nil, err
		}
		for idx, item := range req.Agenda {
			if strings.TrimSpace(item.Title) == "" {
				continue
			}
			duration := item.Duration
			if duration < 0 {
				duration = 0
			}
			if _, err := tx.Exec(ctx, `
				INSERT INTO meeting_agenda_items (meeting_id, order_index, title, description, duration_minutes)
				VALUES ($1::uuid, $2, $3, $4, $5)`,
				meetingID,
				idx+1,
				strings.TrimSpace(item.Title),
				strings.TrimSpace(item.Description),
				duration,
			); err != nil {
				return nil, err
			}
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return s.GetMeeting(ctx, slug)
}

func (s *AppService) DeleteMeeting(ctx context.Context, identifier string) error {
	if err := s.ensureDB(); err != nil {
		return err
	}
	if strings.TrimSpace(identifier) == "" {
		return fmt.Errorf("meeting identifier is required")
	}

	result, err := s.db.Exec(ctx, `
		DELETE FROM meetings
		 WHERE COALESCE(external_id, id::text) = $1`, identifier)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("meeting not found")
	}
	return nil
}

func (s *AppService) JoinMeeting(ctx context.Context, identifier string, userID string) (*core.MeetingJoinResponse, error) {
	if err := s.ensureDB(); err != nil {
		return nil, err
	}
	if strings.TrimSpace(identifier) == "" {
		return nil, fmt.Errorf("meeting identifier is required")
	}

	userID = strings.TrimSpace(userID)

	var meetingID, slug, personaID string
	if err := s.db.QueryRow(ctx, `
		SELECT id::text, COALESCE(external_id, id::text), COALESCE(ai_persona_id, 'aurora')
		  FROM meetings
		 WHERE COALESCE(external_id, id::text) = $1
		 LIMIT 1`, identifier,
	).Scan(&meetingID, &slug, &personaID); err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("meeting not found")
		}
		return nil, err
	}

	if userID == "" {
		var err error
		userID, err = s.firstUserID(ctx)
		if err != nil {
			return nil, err
		}
	}

	resp := &core.MeetingJoinResponse{
		MeetingID:       slug,
		ParticipantID:   userID,
		WebRTCToken:     "",
		AIRealtimeToken: "",
		VoiceSynthToken: "",
		ExpiresAt:       time.Now().Add(10 * time.Minute),
		TurnCredentials: core.TurnCredentials{},
	}

	_ = personaID // reserved for future SFU integrations

	return resp, nil
}

func (s *AppService) UpdateSettings(ctx context.Context, userID string, req core.SettingsUpdateRequest) (*core.SettingsResponse, error) {
	if err := s.ensureDB(); err != nil {
		return nil, err
	}
	userID = strings.TrimSpace(userID)
	if userID == "" {
		var err error
		userID, err = s.firstUserID(ctx)
		if err != nil {
			return nil, err
		}
	}

	tx, err := s.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	if req.Profile != nil {
		if _, err := tx.Exec(ctx, `
			UPDATE app_users
			   SET name = $1,
			       avatar_url = NULLIF($2, ''),
			       updated_at = NOW()
			 WHERE id::text = $3`,
			strings.TrimSpace(req.Profile.DisplayName),
			strings.TrimSpace(req.Profile.AvatarURL),
			userID,
		); err != nil {
			return nil, err
		}
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO user_preferences (user_id)
		VALUES ($1::uuid)
		ON CONFLICT (user_id) DO NOTHING`, userID); err != nil {
		return nil, err
	}

	if req.Personality != nil {
		if _, err := tx.Exec(ctx, `
			UPDATE user_preferences
			   SET default_voice_id = NULLIF($1, ''),
			       default_tone = NULLIF($2, ''),
			       default_energy = NULLIF($3, ''),
			       updated_at = NOW()
			 WHERE user_id::text = $4`,
			strings.TrimSpace(req.Personality.VoicePreset),
			strings.TrimSpace(req.Personality.Tone),
			strings.TrimSpace(req.Personality.Energy),
			userID,
		); err != nil {
			return nil, err
		}
	}

	if req.Privacy != nil {
		retention := req.Privacy.DataRetentionDays
		if retention <= 0 {
			retention = 30
		}

		if _, err := tx.Exec(ctx, `
			UPDATE user_preferences
			   SET recording_enabled = $1,
			       data_retention_days = $2,
			       allow_model_training = $3,
			       notifications_enabled = $4,
			       updated_at = NOW()
			 WHERE user_id::text = $5`,
			req.Privacy.RecordingEnabled,
			retention,
			req.Privacy.AllowModelTraining,
			req.Privacy.RecordingEnabled,
			userID,
		); err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return s.GetSettings(ctx, userID)
}

func (s *AppService) CreateVoicePreset(ctx context.Context, userID string, req core.CreateVoicePresetRequest) (*core.VoicePreset, error) {
	if err := s.ensureDB(); err != nil {
		return nil, err
	}

	userID = strings.TrimSpace(userID)

	if strings.TrimSpace(req.Name) == "" || strings.TrimSpace(req.VoiceID) == "" {
		return nil, fmt.Errorf("name and voiceId are required")
	}

	if userID == "" {
		var err error
		userID, err = s.firstUserID(ctx)
		if err != nil {
			return nil, err
		}
	}

	tx, err := s.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var existingCount int
	if err := tx.QueryRow(ctx, `
		SELECT COUNT(*) FROM voice_presets WHERE user_id::text = $1`, userID).Scan(&existingCount); err != nil {
		return nil, err
	}

	isDefault := existingCount == 0

	var preset core.VoicePreset
	if err := tx.QueryRow(ctx, `
		INSERT INTO voice_presets (user_id, name, voice_id, tone, energy, description, sample_url, is_default)
		VALUES ($1::uuid, $2, $3, NULLIF($4, ''), NULLIF($5, ''), $6, NULLIF($7, ''), $8)
		RETURNING id::text, name, voice_id, COALESCE(tone, ''), COALESCE(energy, ''), COALESCE(description, ''), COALESCE(sample_url, ''), is_default`,
		userID,
		strings.TrimSpace(req.Name),
		strings.TrimSpace(req.VoiceID),
		strings.TrimSpace(req.Tone),
		strings.TrimSpace(req.Energy),
		"Custom voice preset",
		strings.TrimSpace(req.SampleURL),
		isDefault,
	).Scan(
		&preset.ID,
		&preset.Name,
		&preset.VoiceID,
		&preset.Tone,
		&preset.Energy,
		&preset.Description,
		&preset.SampleURL,
		&preset.IsDefault,
	); err != nil {
		return nil, err
	}

	if isDefault {
		if _, err := tx.Exec(ctx, `
			UPDATE voice_presets
			   SET is_default = FALSE
			 WHERE user_id::text = $1
			   AND id::text <> $2`,
			userID,
			preset.ID,
		); err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return &preset, nil
}

func (s *AppService) UpdateVoicePreset(ctx context.Context, userID string, presetID string, req core.UpdateVoicePresetRequest) (*core.VoicePreset, error) {
	if err := s.ensureDB(); err != nil {
		return nil, err
	}

	userID = strings.TrimSpace(userID)
	presetID = strings.TrimSpace(presetID)

	if presetID == "" {
		return nil, fmt.Errorf("preset identifier is required")
	}

	if userID == "" {
		var err error
		userID, err = s.firstUserID(ctx)
		if err != nil {
			return nil, err
		}
	}

	tx, err := s.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var existing core.VoicePreset
	if err := tx.QueryRow(ctx, `
		SELECT id::text, name, voice_id, COALESCE(tone, ''), COALESCE(energy, ''), COALESCE(description, ''), COALESCE(sample_url, ''), is_default
		  FROM voice_presets
		 WHERE id::text = $1
		   AND user_id::text = $2
		 FOR UPDATE`,
		presetID, userID,
	).Scan(
		&existing.ID,
		&existing.Name,
		&existing.VoiceID,
		&existing.Tone,
		&existing.Energy,
		&existing.Description,
		&existing.SampleURL,
		&existing.IsDefault,
	); err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("voice preset not found")
		}
		return nil, err
	}

	updated := existing

	if req.Name != nil {
		val := strings.TrimSpace(*req.Name)
		if val == "" {
			return nil, fmt.Errorf("name cannot be empty")
		}
		updated.Name = val
	}

	if req.VoiceID != nil {
		val := strings.TrimSpace(*req.VoiceID)
		if val == "" {
			return nil, fmt.Errorf("voiceId cannot be empty")
		}
		updated.VoiceID = val
	}

	if req.Tone != nil {
		updated.Tone = strings.TrimSpace(*req.Tone)
	}

	if req.Energy != nil {
		updated.Energy = strings.TrimSpace(*req.Energy)
	}

	if req.SampleURL != nil {
		updated.SampleURL = strings.TrimSpace(*req.SampleURL)
	}

	if req.IsDefault != nil {
		updated.IsDefault = *req.IsDefault
	}

	if _, err := tx.Exec(ctx, `
		UPDATE voice_presets
		   SET name = $1,
		       voice_id = $2,
		       tone = NULLIF($3, ''),
		       energy = NULLIF($4, ''),
		       sample_url = NULLIF($5, ''),
		       is_default = $6,
		       updated_at = NOW()
		 WHERE id::text = $7
		   AND user_id::text = $8`,
		updated.Name,
		updated.VoiceID,
		updated.Tone,
		updated.Energy,
		updated.SampleURL,
		updated.IsDefault,
		presetID,
		userID,
	); err != nil {
		return nil, err
	}

	if updated.IsDefault {
		if _, err := tx.Exec(ctx, `
			UPDATE voice_presets
			   SET is_default = FALSE,
			       updated_at = NOW()
			 WHERE user_id::text = $1
			   AND id::text <> $2`,
			userID,
			presetID,
		); err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return &updated, nil
}

func (s *AppService) DeleteVoicePreset(ctx context.Context, userID string, presetID string) error {
	if err := s.ensureDB(); err != nil {
		return err
	}

	userID = strings.TrimSpace(userID)
	presetID = strings.TrimSpace(presetID)

	if presetID == "" {
		return fmt.Errorf("preset identifier is required")
	}

	if userID == "" {
		var err error
		userID, err = s.firstUserID(ctx)
		if err != nil {
			return err
		}
	}

	tx, err := s.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var wasDefault bool
	if err := tx.QueryRow(ctx, `
		SELECT is_default
		  FROM voice_presets
		 WHERE id::text = $1
		   AND user_id::text = $2
		 FOR UPDATE`,
		presetID, userID,
	).Scan(&wasDefault); err != nil {
		if err == pgx.ErrNoRows {
			return fmt.Errorf("voice preset not found")
		}
		return err
	}

	if _, err := tx.Exec(ctx, `
		DELETE FROM voice_presets
		 WHERE id::text = $1
		   AND user_id::text = $2`,
		presetID, userID,
	); err != nil {
		return err
	}

	if wasDefault {
		var nextPresetID string
		if err := tx.QueryRow(ctx, `
			SELECT id::text
			  FROM voice_presets
			 WHERE user_id::text = $1
			 ORDER BY is_default DESC, updated_at DESC
			 LIMIT 1`, userID).Scan(&nextPresetID); err == nil && nextPresetID != "" {
			if _, err := tx.Exec(ctx, `
				UPDATE voice_presets
				   SET is_default = TRUE,
				       updated_at = NOW()
				 WHERE id::text = $1
				   AND user_id::text = $2`,
				nextPresetID,
				userID,
			); err != nil {
				return err
			}
		}
	}

	return tx.Commit(ctx)
}

func splitCSV(csv string) []string {
	if csv == "" {
		return nil
	}
	parts := strings.Split(csv, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			out = append(out, trimmed)
		}
	}
	return out
}

var nonAlphaNum = regexp.MustCompile(`[^a-z0-9]+`)

func generateMeetingExternalID(title string) string {
	base := strings.ToLower(strings.TrimSpace(title))
	base = nonAlphaNum.ReplaceAllString(base, "-")
	base = strings.Trim(base, "-")
	if base == "" {
		base = "meeting"
	}
	return fmt.Sprintf("%s-%d", base, time.Now().UnixNano())
}
