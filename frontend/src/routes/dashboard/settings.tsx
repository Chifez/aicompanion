import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  DataLifecycleCard,
  PersonalityCard,
  PrivacyCard,
  ProfileCard,
} from '@/components/dashboard/settings-sections';
import {
  LifecycleDialog,
  PresetsDialog,
} from '@/components/dashboard/settings-modals';

const personalities = [
  {
    id: 'aurora',
    label: 'Aurora · Empathic Guide',
    tone: 'Warm, reflective, emotionally intuitive.',
    defaultVoice: 'Evelyn · Soft alto',
  },
  {
    id: 'atlas',
    label: 'Atlas · Strategic Mentor',
    tone: 'Deliberate, analytical, future-oriented.',
    defaultVoice: 'Kai · Neutral baritone',
  },
];

export const Route = createFileRoute('/dashboard/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const [profile, setProfile] = React.useState({
    name: 'Alex Rivera',
    email: 'alex@neuralive.ai',
    role: 'Product Lead',
  });
  const [activePreset, setActivePreset] = React.useState(personalities[0].id);
  const [presetsOpen, setPresetsOpen] = React.useState(false);
  const [lifecycleDialogOpen, setLifecycleDialogOpen] = React.useState(false);
  const [lifecycleAction, setLifecycleAction] = React.useState<
    'export' | 'reset' | 'delete' | null
  >(null);
  const [privacyState, setPrivacyState] = React.useState({
    privateByDefault: true,
    autoDownload: false,
  });

  const presetLabels = personalities.map((personality) => personality.label);

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
        profile={profile}
        onUpdateProfile={(draft) => {
          setProfile(draft);
        }}
      />

      <PersonalityCard
        personalities={personalities}
        onSelectPersonality={(personality) => setActivePreset(personality.id)}
        onManagePresets={() => setPresetsOpen(true)}
      />

      <PrivacyCard
        onTogglePrivacy={(value) =>
          setPrivacyState((previous) => ({
            ...previous,
            privateByDefault: value,
          }))
        }
        onToggleDownloads={(value) =>
          setPrivacyState((previous) => ({
            ...previous,
            autoDownload: value,
          }))
        }
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
        presets={presetLabels}
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
