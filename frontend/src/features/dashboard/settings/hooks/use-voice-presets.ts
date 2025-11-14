import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { VoicePresetsResponse } from '@/types/api';

export function useVoicePresets() {
  return useQuery({
    queryKey: ['settings', 'presets'],
    queryFn: async () => {
      const response =
        await apiClient.get<VoicePresetsResponse>('/settings/presets');
      return response.data;
    },
  });
}
