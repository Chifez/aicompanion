import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { MeetingJoinResponse } from '@/types/api';

export function useMeetingJoin() {
  return useMutation({
    mutationFn: async (meetingId: string) => {
      const response = await apiClient.post<MeetingJoinResponse>(
        `/meetings/${meetingId}/join`
      );
      return response.data;
    },
  });
}
