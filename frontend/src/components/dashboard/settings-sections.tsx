import * as React from 'react';
import clsx from 'clsx';
import { ChevronRight, Download, Lock, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';

type Personality = {
  id: string;
  label: string;
  tone: string;
  defaultVoice: string;
};

export function ProfileCard({
  profile,
  onUpdateProfile,
}: {
  profile: { name: string; email: string; role: string };
  onUpdateProfile: (profile: {
    name: string;
    email: string;
    role: string;
  }) => void;
}) {
  const [draft, setDraft] = React.useState(profile);

  return (
    <Card className="border-slate-200/70 bg-white shadow-sm dark:border-slate-900/60 dark:bg-slate-950/60">
      <CardHeader>
        <CardTitle className="text-base text-slate-900 dark:text-slate-100">
          Profile
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Keep your account details up to date.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Name"
          value={draft.name}
          onChange={(value) =>
            setDraft((previous) => ({ ...previous, name: value }))
          }
        />
        <Field
          label="Email"
          value={draft.email}
          onChange={(value) =>
            setDraft((previous) => ({ ...previous, email: value }))
          }
        />
        <Field
          label="Role"
          value={draft.role}
          onChange={(value) =>
            setDraft((previous) => ({ ...previous, role: value }))
          }
        />
        <div className="flex items-end justify-end">
          <Button
            className="bg-sky-500 text-slate-950 hover:bg-sky-400"
            onClick={() => onUpdateProfile(draft)}
          >
            Update profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function PersonalityCard({
  personalities,
  activeId,
  onSelectPersonality,
  onManagePresets,
}: {
  personalities: Personality[];
  activeId: string;
  onSelectPersonality: (personality: Personality) => void;
  onManagePresets: () => void;
}) {
  return (
    <Card className="border-slate-200/70 bg-white shadow-sm dark:border-slate-900/60 dark:bg-slate-950/60">
      <CardHeader>
        <CardTitle className="text-base text-slate-900 dark:text-slate-100">
          Personality & voice
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Choose how your AI companion greets and responds.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {personalities.map((personality) => (
          <div
            key={personality.id}
            className={clsx(
              'flex flex-col gap-3 rounded-xl border p-4 shadow-sm transition md:flex-row md:items-center md:justify-between',
              personality.id === activeId
                ? 'border-sky-400 bg-sky-500/10 dark:border-sky-500/70 dark:bg-sky-500/10'
                : 'border-slate-200/70 bg-slate-100 hover:border-slate-300 hover:bg-slate-200/70 dark:border-slate-900/60 dark:bg-slate-900/40 dark:hover:border-slate-800 dark:hover:bg-slate-900/60'
            )}
          >
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                {personality.label}
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                {personality.tone}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {personality.defaultVoice}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className={clsx(
                'border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:border-slate-700',
                personality.id === activeId &&
                  'border-sky-400 text-sky-600 dark:border-sky-500/70 dark:text-sky-200'
              )}
              onClick={() => onSelectPersonality(personality)}
            >
              Set as default
            </Button>
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          onClick={onManagePresets}
        >
          Manage presets
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

export function PrivacyCard({
  onTogglePrivacy,
  onToggleDownloads,
}: {
  onTogglePrivacy: (value: boolean) => void;
  onToggleDownloads: (value: boolean) => void;
}) {
  return (
    <Card className="border-slate-200/70 bg-white shadow-sm dark:border-slate-900/60 dark:bg-slate-950/60">
      <CardHeader>
        <CardTitle className="text-base text-slate-900 dark:text-slate-100">
          Privacy & data
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Control how transcripts are stored and anonymised.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
        <SettingToggle
          icon={<Lock className="h-4 w-4" />}
          label="Private by default"
          description="Transcripts stay within your workspace unless shared."
          helper="Recommended"
          defaultChecked
          onChange={onTogglePrivacy}
        />
        <Separator className="border-slate-200/70 dark:border-slate-900/60" />
        <SettingToggle
          icon={<Download className="h-4 w-4" />}
          label="Auto-download transcripts"
          description="Emails you a summary and full transcript after each session."
          helper="Soon"
          onChange={onToggleDownloads}
        />
      </CardContent>
    </Card>
  );
}

export function DataLifecycleCard({
  onExport,
  onReset,
  onDelete,
}: {
  onExport: () => void;
  onReset: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="border border-red-900/40 bg-red-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-red-100">
          <Trash2 className="h-4 w-4" />
          Data lifecycle
        </CardTitle>
        <CardDescription className="text-red-200/80">
          Delete sessions, request exports, or reset your AI memory.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm text-red-100">
        <Button
          variant="outline"
          className="border-red-800/60 text-red-100 hover:bg-red-900/30"
          onClick={onExport}
        >
          Export all transcripts
        </Button>
        <Button
          variant="outline"
          className="border-red-800/60 text-red-100 hover:bg-red-900/30"
          onClick={onReset}
        >
          Reset AI memory
        </Button>
        <Button
          variant="ghost"
          className="text-red-200 hover:bg-red-900/30"
          onClick={onDelete}
        >
          Delete workspace
        </Button>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
        {label}
      </label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900/60"
      />
    </div>
  );
}

function SettingToggle({
  icon,
  label,
  description,
  helper,
  defaultChecked = false,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  helper?: string;
  defaultChecked?: boolean;
  onChange: (value: boolean) => void;
}) {
  const [enabled, setEnabled] = React.useState(defaultChecked);

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/70 bg-slate-100 px-4 py-3 dark:border-slate-900/60 dark:bg-slate-900/40">
      <div className="flex flex-col gap-2 text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 text-slate-200">
            {icon}
          </span>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {label}
            </p>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>
        {helper ? (
          <Badge
            variant="outline"
            className="border-slate-300 text-[10px] text-slate-500 dark:border-slate-800/60 dark:text-slate-400"
          >
            {helper}
          </Badge>
        ) : null}
      </div>
      <Toggle
        aria-label={label}
        className="min-w-14 data-[state=on]:bg-sky-500 data-[state=on]:text-slate-950"
        pressed={enabled}
        onPressedChange={(value) => {
          setEnabled(value);
          onChange(value);
        }}
      >
        {enabled ? 'On' : 'Off'}
      </Toggle>
    </div>
  );
}
