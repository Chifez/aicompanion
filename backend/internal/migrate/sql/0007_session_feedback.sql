-- 0007_session_feedback.sql
-- Add session feedback/rating system for computing feedback scores

CREATE TABLE IF NOT EXISTS session_feedback (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    rating          INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(session_id, user_id)
);

CREATE INDEX IF NOT EXISTS session_feedback_session_idx ON session_feedback (session_id);
CREATE INDEX IF NOT EXISTS session_feedback_user_idx ON session_feedback (user_id, created_at);
CREATE INDEX IF NOT EXISTS session_feedback_rating_idx ON session_feedback (rating, created_at);

