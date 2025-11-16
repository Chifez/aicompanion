import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  VoicePreset,
  CreateVoicePresetRequest,
  UpdateVoicePresetRequest,
} from '@/types/api';

export function useVoicePresetMutations() {
  const queryClient = useQueryClient();

  const createPreset = useMutation({
    mutationFn: async (payload: CreateVoicePresetRequest) => {
      const response = await apiClient.post<VoicePreset>(
        '/settings/presets',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['settings', 'presets'] });
    },
  });

  const updatePreset = useMutation({
    mutationFn: async ({
      presetId,
      payload,
    }: {
      presetId: string;
      payload: UpdateVoicePresetRequest;
    }) => {
      const response = await apiClient.put<VoicePreset>(
        `/settings/presets/${presetId}`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['settings', 'presets'] });
      // Also invalidate settings in case the active preset was updated
      void queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const deletePreset = useMutation({
    mutationFn: async (presetId: string) => {
      await apiClient.delete(`/settings/presets/${presetId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['settings', 'presets'] });
    },
  });

  return { createPreset, updatePreset, deletePreset };
}
