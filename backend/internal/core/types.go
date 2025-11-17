package core

import "time"

type UserProfile struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	AvatarURL string `json:"avatarUrl"`
	PlanTier  string `json:"planTier"`
}

type UserPreferences struct {
	ThemeMode        string `json:"themeMode"`
	Locale           string `json:"locale"`
	DefaultVoiceID   string `json:"defaultVoiceId"`
	DefaultTone      string `json:"defaultTone"`
	DefaultEnergy    string `json:"defaultEnergy"`
	NotificationsOpt bool   `json:"notificationsEnabled"`
}

type AuthSessionResponse struct {
	User        UserProfile      `json:"user"`
	Preferences UserPreferences  `json:"preferences"`
	Features    map[string]bool  `json:"features"`
	Audience    map[string]int64 `json:"audience"`
}

type AuthLoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthLoginResponse struct {
	// Tokens are now sent via HttpOnly cookies, not in response body
	Session AuthSessionResponse `json:"session"`
}

type AuthRegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthRegisterResponse struct {
	// Tokens are now sent via HttpOnly cookies, not in response body
	Session AuthSessionResponse `json:"session"`
}

type AuthRefreshRequest struct {
	RefreshToken string `json:"refreshToken"`
}

type AuthRefreshResponse struct {
	// Tokens are now sent via HttpOnly cookies, not in response body
	Session AuthSessionResponse `json:"session"`
}

type AuthLogoutResponse struct {
	Message string `json:"message"`
}

type DashboardSpotlight struct {
	Quote        string `json:"quote"`
	Conversation string `json:"conversation"`
	TranscriptID string `json:"transcriptId"`
}

type DashboardUpcomingFocus struct {
	FocusArea string    `json:"focusArea"`
	StartTime time.Time `json:"startTime"`
	Duration  int       `json:"durationMinutes"`
}

type DashboardStreak struct {
	Current int `json:"current"`
	Longest int `json:"longest"`
}

type InsightMetric struct {
	ID        string  `json:"id"`
	Label     string  `json:"label"`
	Value     string  `json:"value"`
	Delta     float64 `json:"delta"`
	Direction string  `json:"direction"`
}

type SessionSummary struct {
	ID            string    `json:"id"`
	Title         string    `json:"title"`
	Focus         string    `json:"focus"`
	StartedAt     time.Time `json:"startedAt"`
	DurationMins  int       `json:"durationMinutes"`
	Participants  []string  `json:"participants"`
	Sentiment     string    `json:"sentiment"`
	TranscriptID  string    `json:"transcriptId"`
	ActionSummary string    `json:"actionSummary"`
}

type DashboardOverviewResponse struct {
	Spotlight      DashboardSpotlight     `json:"spotlight"`
	UpcomingFocus  DashboardUpcomingFocus `json:"upcomingFocus"`
	Streak         DashboardStreak        `json:"streak"`
	InsightMetrics []InsightMetric        `json:"insightMetrics"`
	RecentSessions []SessionSummary       `json:"recentSessions"`
}

type MeetingSummary struct {
	ID              string    `json:"id"`
	Title           string    `json:"title"`
	Description     string    `json:"description"`
	StartTime       time.Time `json:"startTime"`
	DurationMinutes int       `json:"durationMinutes"`
	VoiceProfile    string    `json:"voiceProfile"`
	Status          string    `json:"status"`
	Visibility      string    `json:"visibility,omitempty"`
	HostUserID      string    `json:"hostUserId,omitempty"`
}

type MeetingParticipant struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Role      string `json:"role"`
	AvatarURL string `json:"avatarUrl"`
}

type AgendaItem struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Duration    int    `json:"durationMinutes"`
}

type AiPersona struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	VoicePreset string `json:"voicePreset"`
	Tone        string `json:"tone"`
	Energy      string `json:"energy"`
	Description string `json:"description"`
}

type MeetingDetail struct {
	Summary      MeetingSummary       `json:"summary"`
	Agenda       []AgendaItem         `json:"agenda"`
	Participants []MeetingParticipant `json:"participants"`
	AiPersona    AiPersona            `json:"aiPersona"`
	Resources    []ResourceLink       `json:"resources"`
	Notes        string               `json:"notes"`
}

type ResourceLink struct {
	Title string `json:"title"`
	URL   string `json:"url"`
	Type  string `json:"type"`
}

type SessionHealthMetrics struct {
	ConversationBalance string  `json:"conversationBalance"`
	AverageLatencyMs    int     `json:"averageLatencyMs"`
	FeedbackScore       float64 `json:"feedbackScore"`
	Trend               string  `json:"trend"`
}

type QuickStartTemplate struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Badge       string `json:"badge"`
}

type MeetingsResponse struct {
	Scheduled           []MeetingSummary     `json:"scheduled"`
	QuickStartTemplates []QuickStartTemplate `json:"quickStartTemplates"`
	SessionHealth       SessionHealthMetrics `json:"sessionHealth"`
}

type MeetingCreateRequest struct {
	Title           string       `json:"title"`
	Description     string       `json:"description"`
	StartTime       time.Time    `json:"startTime"`
	DurationMinutes int          `json:"durationMinutes"`
	VoiceProfile    string       `json:"voiceProfile"`
	AiPersonaID     string       `json:"aiPersonaId"`
	Agenda          []AgendaItem `json:"agenda"`
	IsInstant       bool         `json:"isInstant,omitempty"`
	Visibility      string       `json:"visibility,omitempty"` // private | public
}

type MeetingUpdateRequest struct {
	Title           *string      `json:"title,omitempty"`
	Description     *string      `json:"description,omitempty"`
	StartTime       *time.Time   `json:"startTime,omitempty"`
	DurationMinutes *int         `json:"durationMinutes,omitempty"`
	VoiceProfile    *string      `json:"voiceProfile,omitempty"`
	AiPersonaID     *string      `json:"aiPersonaId,omitempty"`
	Agenda          []AgendaItem `json:"agenda,omitempty"`
}

type MeetingDetailResponse struct {
	Meeting MeetingDetail `json:"meeting"`
}

type MeetingJoinResponse struct {
	MeetingID       string          `json:"meetingId"`
	ParticipantID   string          `json:"participantId"`
	WebRTCToken     string          `json:"webRtcToken"`     // legacy field
	AIRealtimeToken string          `json:"aiRealtimeToken"` // legacy field
	ExpiresAt       time.Time       `json:"expiresAt"`
	VoiceSynthToken string          `json:"voiceSynthToken"` // legacy field
	TurnCredentials TurnCredentials `json:"turnCredentials"`
	// Future: LiveKit integration
	LiveKitToken string `json:"livekitToken,omitempty"`
	LiveKitURL   string `json:"livekitUrl,omitempty"`
}

type MeetingInvite struct {
	ID        string    `json:"id"`
	MeetingID string    `json:"meetingId"`
	Email     string    `json:"email"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type CreateMeetingInvitesRequest struct {
	Emails []string `json:"emails"`
}

type MeetingInvitesResponse struct {
	Invites []MeetingInvite `json:"invites"`
}

type TurnCredentials struct {
	URL      string `json:"url"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type TranscriptSummary struct {
	ID              string    `json:"id"`
	Title           string    `json:"title"`
	CreatedAt       time.Time `json:"createdAt"`
	DurationMinutes int       `json:"durationMinutes"`
	SentimentScore  float64   `json:"sentimentScore"`
	Keywords        []string  `json:"keywords"`
}

type TranscriptSection struct {
	TimestampMs int    `json:"timestampMs"`
	Speaker     string `json:"speaker"`
	Text        string `json:"text"`
}

type TranscriptDetail struct {
	Summary     TranscriptSummary     `json:"summary"`
	Highlights  []TranscriptHighlight `json:"highlights"`
	ActionItems []string              `json:"actionItems"`
	Sections    []TranscriptSection   `json:"sections"`
}

type TranscriptHighlight struct {
	TimestampMs int    `json:"timestampMs"`
	Speaker     string `json:"speaker"`
	Summary     string `json:"summary"`
}

type TranscriptListResponse struct {
	Transcripts []TranscriptSummary `json:"transcripts"`
}

type TranscriptDetailResponse struct {
	Transcript TranscriptDetail `json:"transcript"`
}

type ProfileSettings struct {
	DisplayName string `json:"displayName"`
	Role        string `json:"role"`
	AvatarURL   string `json:"avatarUrl"`
}

type PersonalitySettings struct {
	PersonaID   string `json:"personaId"`
	PersonaName string `json:"personaName"`
	VoicePreset string `json:"voicePreset"`
	Tone        string `json:"tone"`
	Energy      string `json:"energy"`
	Summary     string `json:"summary"`
}

type PrivacySettings struct {
	RecordingEnabled   bool `json:"recordingEnabled"`
	DataRetentionDays  int  `json:"dataRetentionDays"`
	AllowModelTraining bool `json:"allowModelTraining"`
}

type SettingsResponse struct {
	Profile     ProfileSettings     `json:"profile"`
	Personality PersonalitySettings `json:"personality"`
	Privacy     PrivacySettings     `json:"privacy"`
}

type SettingsUpdateRequest struct {
	Profile     *ProfileSettings     `json:"profile,omitempty"`
	Personality *PersonalitySettings `json:"personality,omitempty"`
	Privacy     *PrivacySettings     `json:"privacy,omitempty"`
}

type VoicePreset struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	VoiceID     string `json:"voiceId"`
	Tone        string `json:"tone"`
	Energy      string `json:"energy"`
	Description string `json:"description"`
	SampleURL   string `json:"sampleUrl"`
	IsDefault   bool   `json:"isDefault"`
}

type VoicePresetsResponse struct {
	Presets []VoicePreset `json:"presets"`
}

type CreateVoicePresetRequest struct {
	Name      string `json:"name"`
	VoiceID   string `json:"voiceId"`
	Tone      string `json:"tone"`
	Energy    string `json:"energy"`
	SampleURL string `json:"sampleUrl"`
}

type UpdateVoicePresetRequest struct {
	Name      *string `json:"name,omitempty"`
	VoiceID   *string `json:"voiceId,omitempty"`
	Tone      *string `json:"tone,omitempty"`
	Energy    *string `json:"energy,omitempty"`
	SampleURL *string `json:"sampleUrl,omitempty"`
	IsDefault *bool   `json:"isDefault,omitempty"`
}
