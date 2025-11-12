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
import { Textarea } from '@/components/ui/textarea';

export function PresetsDialog({
  open,
  onOpenChange,
  presets,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presets: string[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md space-y-4">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            Manage voice presets
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Duplicate, rename, or remove saved AI personality presets.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          {presets.map((preset) => (
            <div
              key={preset}
              className="flex items-center justify-between rounded-lg border border-slate-200/70 bg-slate-100 px-3 py-2 dark:border-slate-800/60 dark:bg-slate-900/40"
            >
              <span>{preset}</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-slate-900 dark:text-slate-300"
              >
                Rename
              </Button>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button
            className="bg-sky-500 text-slate-950 hover:bg-sky-400"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function LifecycleDialog({
  open,
  onOpenChange,
  action,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: 'export' | 'reset' | 'delete' | null;
  onConfirm: () => void;
}) {
  if (!action) {
    return null;
  }

  const copyMap = {
    export: {
      title: 'Export transcripts',
      description:
        'Generate a secure download link with the latest session archives.',
      cta: 'Queue export',
    },
    reset: {
      title: 'Reset AI memory',
      description:
        'Wipe personalised reinforcement data while keeping raw transcripts intact.',
      cta: 'Reset memory',
    },
    delete: {
      title: 'Delete workspace',
      description:
        'Permanently remove all transcripts, AI tuning data, and workspace settings. This cannot be undone.',
      cta: 'Delete workspace',
    },
  } as const;

  const copy = copyMap[action];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md space-y-4">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            {copy.title}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            {copy.description}
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Optional: add context for this request..."
          className="h-28 resize-none border-red-900/40 bg-red-950/20 text-sm text-red-100 placeholder:text-red-200/60"
        />
        <DialogFooter className="flex justify-between">
          <Button
            variant="ghost"
            className="text-slate-200 hover:text-slate-100"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-red-600 text-red-50 hover:bg-red-500"
            onClick={onConfirm}
          >
            {copy.cta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
