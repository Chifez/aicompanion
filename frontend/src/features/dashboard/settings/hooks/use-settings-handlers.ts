import * as React from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useSettingsMutations } from './use-settings-mutations';
import { useVoicePresetMutations } from './use-voice-preset-mutations';
import type { SettingsResponse, VoicePreset } from '@/types/api';
import type { SettingsUpdateRequest } from '@/types/api';
import type { Personality } from '../types';

type UseSettingsHandlersOptions = {
  settings: SettingsResponse;
  presets: VoicePreset[];
};

export function useSettingsHandlers({
  settings,
  presets,
}: UseSettingsHandlersOptions) {
  const { updateSettings } = useSettingsMutations();
  const { updatePreset } = useVoicePresetMutations();

  const handleProfileUpdate = React.useCallback(
    (draft: { name: string; email: string; role: string }) => {
      const payload: SettingsUpdateRequest = {
        profile: {
          displayName: draft.name,
          role: draft.role,
        },
      };
      updateSettings.mutate(payload, {
        onSuccess: () => {
          const auth = useAuthStore.getState();
          if (auth.session) {
            useAuthStore.setState({
              session: {
                ...auth.session,
                user: {
                  ...auth.session.user,
                  name: draft.name,
                },
              },
            });
          }
        },
      });
    },
    [updateSettings]
  );

  const handleSelectPersonality = React.useCallback(
    (personality: Personality) => {
      const preset = presets.find((item) => item.id === personality.id);
      if (!preset) {
        return;
      }
      // Update settings to use this preset
      const payload: SettingsUpdateRequest = {
        personality: {
          voicePreset: preset.name,
          tone: preset.tone,
          energy: preset.energy,
        },
      };
      updateSettings.mutate(payload);

      // Also set this preset as default and unset others
      if (!preset.isDefault) {
        // First, unset all other presets as default
        presets.forEach((p) => {
          if (p.isDefault && p.id !== preset.id) {
            updatePreset.mutate({
              presetId: p.id,
              payload: { isDefault: false },
            });
          }
        });
        // Then set this one as default
        updatePreset.mutate({
          presetId: preset.id,
          payload: { isDefault: true },
        });
      }
    },
    [presets, updateSettings, updatePreset]
  );

  const handleToggleRecording = React.useCallback(
    (value: boolean) => {
      const payload: SettingsUpdateRequest = {
        privacy: {
          recordingEnabled: value,
          // Preserve existing values
          dataRetentionDays: settings.privacy.dataRetentionDays,
          allowModelTraining: settings.privacy.allowModelTraining,
        },
      };
      updateSettings.mutate(payload);
    },
    [settings.privacy, updateSettings]
  );

  const handleToggleModelTraining = React.useCallback(
    (value: boolean) => {
      const payload: SettingsUpdateRequest = {
        privacy: {
          allowModelTraining: value,
          // Preserve existing values
          recordingEnabled: settings.privacy.recordingEnabled,
          dataRetentionDays: settings.privacy.dataRetentionDays,
        },
      };
      updateSettings.mutate(payload);
    },
    [settings.privacy, updateSettings]
  );

  return {
    handleProfileUpdate,
    handleSelectPersonality,
    handleToggleRecording,
    handleToggleModelTraining,
  };
}
