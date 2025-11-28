import type { ScheduledMeeting } from './transform';

/**
 * Checks if a meeting is actionable (can be started, edited, etc.)
 * Returns false if meeting has ended or the end time has passed
 */
export function isMeetingActionable(meeting: ScheduledMeeting): boolean {
  // If meeting is explicitly ended, it's not actionable
  if (meeting.status === 'ended') {
    return false;
  }

  // Calculate meeting end time
  const startTime = new Date(meeting.startTime);
  const endTime = new Date(
    startTime.getTime() + meeting.durationMinutes * 60 * 1000
  );
  const now = new Date();

  // If meeting end time has passed, it's not actionable
  if (now > endTime) {
    return false;
  }

  return true;
}

/**
 * Gets a human-readable status message for a meeting
 */
export function getMeetingStatusMessage(meeting: ScheduledMeeting): string {
  if (meeting.status === 'ended') {
    return 'Meeting ended';
  }

  const startTime = new Date(meeting.startTime);
  const endTime = new Date(
    startTime.getTime() + meeting.durationMinutes * 60 * 1000
  );
  const now = new Date();

  if (now > endTime) {
    return 'Meeting finished';
  }

  if (meeting.status === 'active') {
    return 'In progress';
  }

  if (meeting.status === 'scheduled' || meeting.status === 'instant') {
    return 'Scheduled';
  }

  return meeting.status;
}
