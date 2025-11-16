export type AuthSessionResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    planTier: string;
  };
  preferences: {
    themeMode: string;
    locale: string;
    defaultVoiceId: string;
    defaultTone: string;
    defaultEnergy: string;
    notificationsEnabled: boolean;
  };
  features: Record<string, boolean>;
  audience: Record<string, number>;
};

export type DashboardOverviewResponse = {
  spotlight: {
    quote: string;
    conversation: string;
    transcriptId: string;
  };
  upcomingFocus: {
    focusArea: string;
    startTime: string;
    durationMinutes: number;
  };
  streak: {
    current: number;
    longest: number;
  };
  insightMetrics: Array<{
    id: string;
    label: string;
    value: string;
    delta: number;
    direction: 'up' | 'down' | string;
  }>;
  recentSessions: Array<{
    id: string;
    title: string;
    focus: string;
    startedAt: string;
    durationMinutes: number;
    participants: string[];
    sentiment: string;
    transcriptId: string;
    actionSummary: string;
  }>;
};

export type MeetingsResponse = {
  scheduled: Array<{
    id: string;
    title: string;
    description: string;
    startTime: string;
    durationMinutes: number;
    voiceProfile: string;
    status: string;
  }>;
  quickStartTemplates: Array<{
    id: string;
    title: string;
    description: string;
    badge: string;
  }>;
  sessionHealth: {
    conversationBalance: string;
    averageLatencyMs: number;
    feedbackScore: number;
    trend: string;
  };
};

export type MeetingDetail = {
  summary: {
    id: string;
    title: string;
    description: string;
    startTime: string;
    durationMinutes: number;
    voiceProfile: string;
    status: string;
  };
  agenda: Array<{
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
  }>;
  participants: Array<{
    id: string;
    name: string;
    role: string;
    avatarUrl: string;
  }>;
  aiPersona: {
    id: string;
    name: string;
    voicePreset: string;
    tone: string;
    energy: string;
    description: string;
  };
  resources: Array<{
    title: string;
    url: string;
    type: string;
  }>;
  notes: string;
};

export type TranscriptListResponse = {
  transcripts: Array<{
    id: string;
    title: string;
    createdAt: string;
    durationMinutes: number;
    sentimentScore: number;
    keywords: string[];
  }>;
};

export type TranscriptDetailResponse = {
  transcript: {
    summary: {
      id: string;
      title: string;
      createdAt: string;
      durationMinutes: number;
      sentimentScore: number;
    };
    highlights: Array<{
      timestampMs: number;
      speaker: string;
      summary: string;
    }>;
    actionItems: string[];
    sections: Array<{
      timestampMs: number;
      speaker: string;
      text: string;
    }>;
  };
};

export type SettingsResponse = {
  profile: {
    displayName: string;
    role: string;
    avatarUrl: string;
  };
  personality: {
    personaId: string;
    personaName: string;
    voicePreset: string;
    tone: string;
    energy: string;
    summary: string;
  };
  privacy: {
    recordingEnabled: boolean;
    dataRetentionDays: number;
    allowModelTraining: boolean;
  };
};

export type VoicePreset = {
  id: string;
  name: string;
  voiceId: string;
  tone: string;
  energy: string;
  description: string;
  sampleUrl: string;
  isDefault: boolean;
};

export type VoicePresetsResponse = {
  presets: VoicePreset[];
};

export type CreateVoicePresetRequest = {
  name: string;
  voiceId: string;
  tone: string;
  energy: string;
  sampleUrl: string;
};

export type UpdateVoicePresetRequest = {
  name?: string;
  voiceId?: string;
  tone?: string;
  energy?: string;
  sampleUrl?: string;
  isDefault?: boolean;
};

export type MeetingCreateRequest = {
  title: string;
  description: string;
  startTime: string;
  durationMinutes: number;
  voiceProfile: string;
  aiPersonaId?: string;
  agenda?: Array<{
    title: string;
    description: string;
    durationMinutes: number;
  }>;
  isInstant?: boolean;
};

export type AuthResponseBase = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  session: AuthSessionResponse;
};

export type AuthLoginResponse = AuthResponseBase;
export type AuthRegisterResponse = AuthResponseBase;

export type AuthRefreshResponse = AuthResponseBase;

export type MeetingJoinResponse = {
  meetingId: string;
  participantId: string;
  webRtcToken: string;
  aiRealtimeToken: string;
  voiceSynthToken: string;
  expiresAt: string;
  turnCredentials: {
    url: string;
    username: string;
    password: string;
  };
};

export type SettingsUpdateRequest = {
  profile?: {
    displayName?: string;
    role?: string;
    avatarUrl?: string;
  };
  personality?: {
    personaId?: string;
    personaName?: string;
    voicePreset?: string;
    tone?: string;
    energy?: string;
    summary?: string;
  };
  privacy?: {
    recordingEnabled?: boolean;
    dataRetentionDays?: number;
    allowModelTraining?: boolean;
  };
};
