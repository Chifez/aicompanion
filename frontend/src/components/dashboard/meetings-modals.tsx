import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ScheduledMeeting } from './meetings-sections';

type MeetingFormState = Pick<
  ScheduledMeeting,
  'title' | 'description' | 'start' | 'duration' | 'voice'
>;

export function MeetingEditorDialog({
  open,
  onOpenChange,
  initialMeeting,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMeeting?: ScheduledMeeting | null;
  onSubmit: (meeting: MeetingFormState) => void;
  onDelete?: () => void;
}) {
  const [form, setForm] = React.useState<MeetingFormState>(
    initialMeeting ?? {
      title: '',
      description: '',
      start: '',
      duration: '',
      voice: '',
    }
  );

  React.useEffect(() => {
    setForm(
      initialMeeting ?? {
        title: '',
        description: '',
        start: '',
        duration: '',
        voice: '',
      }
    );
  }, [initialMeeting]);

  const updateField = (field: keyof MeetingFormState) => (value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const isEditing = Boolean(initialMeeting);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg space-y-4">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            {isEditing ? 'Adjust meeting' : 'Create meeting'}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Configure the AI co-host experience before you go live.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <Field label="Title">
            <Input
              value={form.title}
              onChange={(event) => updateField('title')(event.target.value)}
              placeholder="Morning momentum"
              className="border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900/40"
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={(event) =>
                updateField('description')(event.target.value)
              }
              placeholder="Kickstart with tailored prompts and motivational check-in."
              className="h-24 resize-none border-slate-300 bg-white text-sm dark:border-slate-800 dark:bg-slate-900/40"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start time">
              <Input
                value={form.start}
                onChange={(event) => updateField('start')(event.target.value)}
                placeholder="Tomorrow · 8:30 AM"
                className="border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900/40"
              />
            </Field>
            <Field label="Duration">
              <Input
                value={form.duration}
                onChange={(event) =>
                  updateField('duration')(event.target.value)
                }
                placeholder="25 mins"
                className="border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900/40"
              />
            </Field>
          </div>
          <Field label="Voice & personality">
            <Input
              value={form.voice}
              onChange={(event) => updateField('voice')(event.target.value)}
              placeholder="Evelyn · Warm mentor"
              className="border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900/40"
            />
          </Field>
        </div>

        <DialogFooter className="flex items-center justify-between gap-4">
          {isEditing ? (
            <Button
              variant="ghost"
              className="text-red-500 hover:text-red-400"
              onClick={onDelete}
            >
              Delete meeting
            </Button>
          ) : (
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Draft mode
            </span>
          )}
          <Button
            className="bg-sky-500 text-slate-950 hover:bg-sky-400"
            onClick={() => {
              onSubmit(form);
              onOpenChange(false);
            }}
          >
            {isEditing ? 'Save changes' : 'Create meeting'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TemplateLaunchDialog({
  open,
  onOpenChange,
  template,
  onLaunch,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: { id: string; title: string; description: string } | null;
  onLaunch: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md space-y-4">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            Launch template: {template?.title ?? 'Template'}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            We’ll pre-configure the AI companion tone, prompts, and follow-up
            cadence for this template.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={template?.description ?? ''}
          readOnly
          className="h-32 resize-none border-slate-300 bg-white text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200"
        />
        <DialogFooter>
          <Button
            variant="ghost"
            className="text-slate-600 hover:text-slate-900 dark:text-slate-300"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-sky-500 text-slate-950 hover:bg-sky-400"
            onClick={onLaunch}
          >
            Launch session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs uppercase tracking-[0.3em] text-slate-500">
        {label}
      </Label>
      {children}
    </div>
  );
}
