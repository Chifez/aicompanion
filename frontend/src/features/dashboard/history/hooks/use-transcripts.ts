import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { TranscriptListResponse } from '@/types/api';

export function useTranscripts() {
  return useQuery({
    queryKey: ['transcripts'],
    queryFn: async () => {
      const response = await apiClient.get<TranscriptListResponse>('/history');
      return response.data;
    },
  });
}
