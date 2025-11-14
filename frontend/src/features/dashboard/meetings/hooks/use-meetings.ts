import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { MeetingsResponse } from '@/types/api';

export function useMeetings() {
  return useQuery({
    queryKey: ['meetings'],
    queryFn: async () => {
      const response = await apiClient.get<MeetingsResponse>('/meetings');
      return response.data;
    },
  });
}
