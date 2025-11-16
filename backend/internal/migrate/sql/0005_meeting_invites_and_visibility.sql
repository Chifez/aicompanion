-- 0005_meeting_invites_and_visibility.sql
-- Add visibility and actual start time to meetings and introduce meeting_invites

-- Visibility: 'private' (invited/host only) or 'public' (anyone with link can join)
ALTER TABLE meetings
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'private',
  ADD COLUMN IF NOT EXISTS actual_started_at TIMESTAMPTZ;

-- Meeting invites link users/emails to meetings with an invite token and status
CREATE TABLE IF NOT EXISTS meeting_invites (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id         UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    invited_by_user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    invitee_user_id    UUID REFERENCES app_users(id) ON DELETE SET NULL,
    email              TEXT NOT NULL,
    invite_token       TEXT NOT NULL UNIQUE,
    status             TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, declined, revoked, expired
    expires_at         TIMESTAMPTZ,
    accepted_at        TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS meeting_invites_meeting_idx
  ON meeting_invites (meeting_id, status);

CREATE INDEX IF NOT EXISTS meeting_invites_invitee_idx
  ON meeting_invites (invitee_user_id, status);


