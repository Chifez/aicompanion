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
import { useSettingsHandlers } from './hooks/use-settings-handlers';
import type { Personality } from './types';
import { useAuthStore } from '@/stores/auth-store';
import { useDialogState } from '@/hooks/use-dialog-state';

export function SettingsPage() {
  const sessionEmail = useAuthStore((state) => state.session?.user.email ?? '');
  const settingsQuery = useSettings();
  const presetsQuery = useVoicePresets();

  const presets = presetsQuery.data?.presets ?? [];
  const personalities: Personality[] = React.useMemo(
    () =>
      presets.map((preset) => ({
        id: preset.id,
        label: preset.name,
        tone: preset.tone || 'Custom tone',
        defaultVoice: preset.voiceId,
      })),
    [presets]
  );

  const activePresetId = React.useMemo(() => {
    if (!settingsQuery.data) {
      return personalities[0]?.id ?? '';
    }
    const match = presets.find(
      (preset) => preset.name === settingsQuery.data?.personality.voicePreset
    );
    return match?.id ?? personalities[0]?.id ?? '';
  }, [personalities, presets, settingsQuery.data]);

  const presetsDialog = useDialogState(false);
  const lifecycleDialog = useDialogState(false);
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

  const profileState = React.useMemo(
    () => ({
      name: settingsQuery.data.profile.displayName,
      email: sessionEmail,
      role: settingsQuery.data.profile.role,
    }),
    [settingsQuery.data, sessionEmail]
  );

  const {
    handleProfileUpdate,
    handleSelectPersonality,
    handleToggleRecording,
    handleToggleModelTraining,
  } = useSettingsHandlers({
    settings: settingsQuery.data,
    presets,
  });

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
        onManagePresets={presetsDialog.openDialog}
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
          lifecycleDialog.openDialog();
        }}
        onReset={() => {
          setLifecycleAction('reset');
          lifecycleDialog.openDialog();
        }}
        onDelete={() => {
          setLifecycleAction('delete');
          lifecycleDialog.openDialog();
        }}
      />

      <PresetsDialog
        open={presetsDialog.open}
        onOpenChange={presetsDialog.setOpen}
        presets={presets}
      />
      <LifecycleDialog
        open={lifecycleDialog.open}
        onOpenChange={(open) => {
          lifecycleDialog.setOpen(open);
          if (!open) setLifecycleAction(null);
        }}
        action={lifecycleAction}
        onConfirm={() => {
          lifecycleDialog.closeDialog();
          setLifecycleAction(null);
        }}
      />
    </div>
  );
}
