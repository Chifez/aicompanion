-- 0006_meeting_status_lifecycle.sql
-- Clarify meeting status semantics and add actual_started_at default behavior

-- Ensure status has expected values; we keep it as free-text but document usage:
--   - 'scheduled': future meeting, not yet started
--   - 'instant': created and started immediately
--   - 'active': host has explicitly started the meeting
--   - 'ended': meeting has been ended
-- No schema change needed for enum; enforcement is at the application layer.

-- For analytics we may want actual_started_at populated when a meeting becomes active.
-- The column is added in 0005; here we just ensure it exists.
ALTER TABLE meetings
  ADD COLUMN IF NOT EXISTS actual_started_at TIMESTAMPTZ;


