import * as React from 'react';
import { ProfileCard } from './components/profile-card';
import { PersonalityCard } from './components/personality-card';
import { PrivacyCard } from './components/privacy-card';
import { DataLifecycleCard } from './components/data-lifecycle-card';
import { PresetsDialog } from './components/presets-dialog';
import { LifecycleDialog } from './components/lifecycle-dialog';
import { SettingsSkeleton } from './components/settings-skeleton';
import { useSettings } from './hooks/use-settings';
import { useVoicePresets } from './hooks/use-voice-presets';
import { useSettingsMutations } from './hooks/use-settings-mutations';
import type { Personality } from './types';
import { useAuthStore } from '@/stores/auth-store';
import type { SettingsUpdateRequest } from '@/types/api';

export function SettingsPage() {
  const sessionEmail = useAuthStore((state) => state.session?.user.email ?? '');
  const settingsQuery = useSettings();
  const presetsQuery = useVoicePresets();
  const { updateSettings } = useSettingsMutations();

  const presets = presetsQuery.data?.presets ?? [];
  const personalities: Personality[] = presets.map((preset) => ({
    id: preset.id,
    label: preset.name,
    tone: preset.tone || 'Custom tone',
    defaultVoice: preset.voiceId,
  }));

  const activePresetId = React.useMemo(() => {
    if (!settingsQuery.data) {
      return personalities[0]?.id ?? '';
    }
    const match = presets.find(
      (preset) => preset.name === settingsQuery.data?.personality.voicePreset
    );
    return match?.id ?? personalities[0]?.id ?? '';
  }, [personalities, presets, settingsQuery.data]);

  const [presetsOpen, setPresetsOpen] = React.useState(false);
  const [lifecycleDialogOpen, setLifecycleDialogOpen] = React.useState(false);
  const [lifecycleAction, setLifecycleAction] = React.useState<
    'export' | 'reset' | 'delete' | null
  >(null);

  if (settingsQuery.isLoading || presetsQuery.isLoading) {
    return <SettingsSkeleton />;
  }

  if (settingsQuery.isError || presetsQuery.isError || !settingsQuery.data) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-4 py-24 text-center text-slate-300">
        <p className="text-lg font-semibold">Unable to load settings.</p>
        <p className="text-sm text-slate-400">
          {(settingsQuery.error as Error)?.message ??
            (presetsQuery.error as Error)?.message ??
            'Please refresh the page or try again later.'}
        </p>
      </div>
    );
  }

  const profileState = {
    name: settingsQuery.data.profile.displayName,
    email: sessionEmail,
    role: settingsQuery.data.profile.role,
  };

  const handleProfileUpdate = (draft: {
    name: string;
    email: string;
    role: string;
  }) => {
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
  };

  const handleSelectPersonality = (personality: Personality) => {
    const preset = presets.find((item) => item.id === personality.id);
    if (!preset) {
      return;
    }
    const payload: SettingsUpdateRequest = {
      personality: {
        voicePreset: preset.name,
        tone: preset.tone,
        energy: preset.energy,
      },
    };
    updateSettings.mutate(payload);
  };

  const handleToggleRecording = (value: boolean) => {
    const payload: SettingsUpdateRequest = {
      privacy: {
        recordingEnabled: value,
      },
    };
    updateSettings.mutate(payload);
  };

  const handleToggleModelTraining = (value: boolean) => {
    const payload: SettingsUpdateRequest = {
      privacy: {
        allowModelTraining: value,
      },
    };
    updateSettings.mutate(payload);
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 text-slate-900 dark:text-slate-100">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Configure your AI companion preferences, privacy controls, and
          workspace profile.
        </p>
      </header>

      <ProfileCard
        profile={profileState}
        onUpdateProfile={handleProfileUpdate}
      />

      <PersonalityCard
        personalities={personalities}
        activeId={activePresetId}
        onSelectPersonality={handleSelectPersonality}
        onManagePresets={() => setPresetsOpen(true)}
      />

      <PrivacyCard
        recordingEnabled={settingsQuery.data.privacy.recordingEnabled}
        allowModelTraining={settingsQuery.data.privacy.allowModelTraining}
        onTogglePrivacy={handleToggleRecording}
        onToggleDownloads={handleToggleModelTraining}
      />

      <DataLifecycleCard
        onExport={() => {
          setLifecycleAction('export');
          setLifecycleDialogOpen(true);
        }}
        onReset={() => {
          setLifecycleAction('reset');
          setLifecycleDialogOpen(true);
        }}
        onDelete={() => {
          setLifecycleAction('delete');
          setLifecycleDialogOpen(true);
        }}
      />

      <PresetsDialog
        open={presetsOpen}
        onOpenChange={setPresetsOpen}
        presets={presets.map((preset) => preset.name)}
      />
      <LifecycleDialog
        open={lifecycleDialogOpen}
        onOpenChange={(open) => {
          setLifecycleDialogOpen(open);
          if (!open) setLifecycleAction(null);
        }}
        action={lifecycleAction}
        onConfirm={() => {
          setLifecycleDialogOpen(false);
          setLifecycleAction(null);
        }}
      />
    </div>
  );
}
