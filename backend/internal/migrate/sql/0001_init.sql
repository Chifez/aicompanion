CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users and preferences
CREATE TABLE IF NOT EXISTS app_users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    avatar_url      TEXT,
    plan_tier       TEXT NOT NULL DEFAULT 'free',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id             UUID PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
    theme_mode          TEXT NOT NULL DEFAULT 'dark',
    locale              TEXT NOT NULL DEFAULT 'en-US',
    default_voice_id    TEXT,
    default_tone        TEXT,
    default_energy      TEXT,
    notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI personas used for meetings
CREATE TABLE IF NOT EXISTS ai_personas (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    voice_preset TEXT NOT NULL,
    tone        TEXT NOT NULL,
    energy      TEXT NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Meetings and participants
CREATE TABLE IF NOT EXISTS meetings (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id      TEXT UNIQUE,
    title            TEXT NOT NULL,
    description      TEXT,
    host_user_id     UUID REFERENCES app_users(id),
    ai_persona_id    TEXT REFERENCES ai_personas(id),
    start_time       TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL,
    voice_profile    TEXT,
    status           TEXT NOT NULL DEFAULT 'scheduled',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meeting_participants (
    meeting_id   UUID REFERENCES meetings(id) ON DELETE CASCADE,
    user_id      UUID REFERENCES app_users(id),
    display_name TEXT NOT NULL,
    role         TEXT NOT NULL,
    avatar_url   TEXT,
    joined_at    TIMESTAMPTZ,
    left_at      TIMESTAMPTZ,
    PRIMARY KEY (meeting_id, display_name)
);

CREATE TABLE IF NOT EXISTS meeting_agenda_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id      UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    order_index     INTEGER NOT NULL,
    title           TEXT NOT NULL,
    description     TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS meeting_agenda_order_idx ON meeting_agenda_items (meeting_id, order_index);

-- Sessions & transcripts derived from meetings
CREATE TABLE IF NOT EXISTS sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id      UUID REFERENCES meetings(id) ON DELETE SET NULL,
    title           TEXT NOT NULL,
    focus           TEXT,
    started_at      TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL,
    sentiment       TEXT,
    action_summary  TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transcripts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID REFERENCES sessions(id) ON DELETE CASCADE,
    storage_path    TEXT,
    raw_content     JSONB,
    language        TEXT,
    confidence      NUMERIC,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transcript_sections (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
    timestamp_ms  INTEGER NOT NULL,
    speaker       TEXT NOT NULL,
    text          TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS transcript_sections_idx ON transcript_sections (transcript_id, timestamp_ms);

CREATE TABLE IF NOT EXISTS transcript_highlights (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
    timestamp_ms  INTEGER NOT NULL,
    speaker       TEXT NOT NULL,
    summary       TEXT NOT NULL,
    action_item   BOOLEAN NOT NULL DEFAULT FALSE
);

-- Voice presets for settings
CREATE TABLE IF NOT EXISTS voice_presets (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES app_users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    voice_id    TEXT NOT NULL,
    tone        TEXT,
    energy      TEXT,
    description TEXT,
    sample_url  TEXT,
    is_default  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS voice_presets_user_idx ON voice_presets (user_id, is_default);

