import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { TranscriptDetailResponse } from '@/types/api';

export function useTranscriptDetail(transcriptId: string | null) {
  return useQuery({
    queryKey: ['transcripts', transcriptId],
    queryFn: async () => {
      if (!transcriptId || transcriptId === 'export-all') {
        return null;
      }
      const response = await apiClient.get<TranscriptDetailResponse>(
        `/history/${transcriptId}`
      );
      return response.data;
    },
    enabled: Boolean(transcriptId && transcriptId !== 'export-all'),
  });
}
