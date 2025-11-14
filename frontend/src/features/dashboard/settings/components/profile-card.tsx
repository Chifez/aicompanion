import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Profile } from '../types';

type ProfileCardProps = {
  profile: Profile;
  onUpdateProfile: (profile: Profile) => void;
};

export function ProfileCard({ profile, onUpdateProfile }: ProfileCardProps) {
  const [changes, setChanges] = React.useState<Partial<Profile>>({});

  const draft = React.useMemo<Profile>(
    () => ({
      ...profile,
      ...changes,
    }),
    [profile, changes]
  );

  const isDirty = React.useMemo(() => {
    return Object.entries(changes).some(([key, value]) => {
      const typedKey = key as keyof Profile;
      return value !== undefined && value !== profile[typedKey];
    });
  }, [changes, profile]);

  const updateField = (field: keyof Profile) => (value: string) => {
    setChanges((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    onUpdateProfile(draft);
    setChanges({});
  };

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
        <Field label="Name" value={draft.name} onChange={updateField('name')} />
        <Field
          label="Email"
          value={draft.email}
          onChange={updateField('email')}
        />
        <Field label="Role" value={draft.role} onChange={updateField('role')} />
        <div className="flex items-end justify-end">
          <Button
            className="bg-sky-500 text-slate-950 hover:bg-sky-400"
            disabled={!isDirty}
            onClick={handleSubmit}
          >
            Update profile
          </Button>
        </div>
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
