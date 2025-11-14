package httpapi

import "github.com/aicomp/ai-virtual-chat/backend/internal/core"

type (
	UserProfile             = core.UserProfile
	UserPreferences         = core.UserPreferences
	AuthSessionResponse     = core.AuthSessionResponse
	DashboardSpotlight      = core.DashboardSpotlight
	DashboardUpcomingFocus  = core.DashboardUpcomingFocus
	DashboardStreak         = core.DashboardStreak
	InsightMetric           = core.InsightMetric
	SessionSummary          = core.SessionSummary
	DashboardOverviewResponse = core.DashboardOverviewResponse
	MeetingSummary          = core.MeetingSummary
	MeetingParticipant      = core.MeetingParticipant
	AgendaItem              = core.AgendaItem
	AiPersona               = core.AiPersona
	MeetingDetail           = core.MeetingDetail
	ResourceLink            = core.ResourceLink
	SessionHealthMetrics    = core.SessionHealthMetrics
	QuickStartTemplate      = core.QuickStartTemplate
	MeetingsResponse        = core.MeetingsResponse
	MeetingCreateRequest    = core.MeetingCreateRequest
	MeetingUpdateRequest    = core.MeetingUpdateRequest
	MeetingDetailResponse   = core.MeetingDetailResponse
	MeetingJoinResponse     = core.MeetingJoinResponse
	TurnCredentials         = core.TurnCredentials
	TranscriptSummary       = core.TranscriptSummary
	TranscriptSection       = core.TranscriptSection
	TranscriptDetail        = core.TranscriptDetail
	TranscriptHighlight     = core.TranscriptHighlight
	TranscriptListResponse  = core.TranscriptListResponse
	TranscriptDetailResponse = core.TranscriptDetailResponse
	ProfileSettings         = core.ProfileSettings
	PersonalitySettings     = core.PersonalitySettings
	PrivacySettings         = core.PrivacySettings
	SettingsResponse        = core.SettingsResponse
	SettingsUpdateRequest   = core.SettingsUpdateRequest
	VoicePreset             = core.VoicePreset
	VoicePresetsResponse    = core.VoicePresetsResponse
	CreateVoicePresetRequest = core.CreateVoicePresetRequest
	UpdateVoicePresetRequest = core.UpdateVoicePresetRequest
	AuthLoginRequest         = core.AuthLoginRequest
	AuthLoginResponse        = core.AuthLoginResponse
	AuthRegisterRequest      = core.AuthRegisterRequest
	AuthRegisterResponse     = core.AuthRegisterResponse
	AuthRefreshRequest       = core.AuthRefreshRequest
	AuthRefreshResponse      = core.AuthRefreshResponse
	AuthLogoutResponse       = core.AuthLogoutResponse
)

type APIError struct {
	Message string `json:"message"`
}
