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
import { toDateTimeLocalValue } from '../utils/format';
import type { MeetingFormState } from '../utils/transform';
import { useSyncFormState } from '@/hooks/use-sync-form-state';

const defaultMeeting: MeetingFormState = {
  title: '',
  description: '',
  startTime: new Date().toISOString(),
  durationMinutes: 30,
  voiceProfile: '',
};

type MeetingEditorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMeeting?: MeetingFormState | null;
  onSubmit: (meeting: MeetingFormState) => void;
  onDelete?: () => void;
};

export function MeetingEditorDialog({
  open,
  onOpenChange,
  initialMeeting,
  onSubmit,
  onDelete,
}: MeetingEditorDialogProps) {
  const [form, setForm] = useSyncFormState(initialMeeting, defaultMeeting);

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
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  title: event.target.value,
                }))
              }
              placeholder="Morning momentum"
              className="border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900/40"
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  description: event.target.value,
                }))
              }
              placeholder="Kickstart with tailored prompts and motivational check-in."
              className="h-24 resize-none border-slate-300 bg-white text-sm dark:border-slate-800 dark:bg-slate-900/40"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start time">
              <Input
                type="datetime-local"
                value={toDateTimeLocalValue(form.startTime)}
                onChange={(event) => {
                  const value = event.target.value;
                  setForm((previous) => ({
                    ...previous,
                    startTime: value
                      ? new Date(value).toISOString()
                      : previous.startTime,
                  }));
                }}
                className="border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900/40"
              />
            </Field>
            <Field label="Duration (minutes)">
              <Input
                type="number"
                min={5}
                value={form.durationMinutes}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    durationMinutes:
                      Number(event.target.value) || previous.durationMinutes,
                  }))
                }
                className="border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900/40"
              />
            </Field>
          </div>
          <Field label="Voice & personality">
            <Input
              value={form.voiceProfile}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  voiceProfile: event.target.value,
                }))
              }
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
