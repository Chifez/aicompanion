import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { MeetingDetail } from '@/types/api';

export function useMeetingDetail(meetingId: string | null) {
  return useQuery({
    queryKey: ['meetings', meetingId],
    queryFn: async () => {
      if (!meetingId) {
        return null;
      }
      const response = await apiClient.get<{ meeting: MeetingDetail }>(
        `/meetings/${meetingId}`
      );
      return response.data.meeting;
    },
    enabled: Boolean(meetingId),
  });
}
