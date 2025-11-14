import type { MeetingsResponse } from '@/types/api';

export type ScheduledMeeting = {
  id: string;
  title: string;
  description: string;
  startTime: string;
  durationMinutes: number;
  voiceProfile: string;
  status: string;
};

export type MeetingFormState = {
  title: string;
  description: string;
  startTime: string;
  durationMinutes: number;
  voiceProfile: string;
};

export function toScheduledMeeting(
  meeting: MeetingsResponse['scheduled'][number]
): ScheduledMeeting {
  return {
    id: meeting.id,
    title: meeting.title,
    description: meeting.description,
    startTime: meeting.startTime,
    durationMinutes: meeting.durationMinutes,
    voiceProfile: meeting.voiceProfile,
    status: meeting.status,
  };
}

export function toMeetingDraft(meeting: ScheduledMeeting): MeetingFormState {
  return {
    title: meeting.title,
    description: meeting.description,
    startTime: meeting.startTime,
    durationMinutes: meeting.durationMinutes,
    voiceProfile: meeting.voiceProfile,
  };
}
