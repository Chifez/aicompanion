import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { SettingsUpdateRequest } from '@/types/api';

export function useSettingsMutations() {
  const queryClient = useQueryClient();

  const updateSettings = useMutation({
    mutationFn: async (payload: SettingsUpdateRequest) => {
      await apiClient.put('/settings', payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['settings'] });
      void queryClient.invalidateQueries({ queryKey: ['settings', 'presets'] });
    },
  });

  return { updateSettings };
}
