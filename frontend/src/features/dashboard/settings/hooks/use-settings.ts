import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { SettingsResponse } from '@/types/api';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await apiClient.get<SettingsResponse>('/settings');
      return response.data;
    },
  });
}
