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
import type { TranscriptRecord } from './history-sections';

export function TranscriptDialog({
  open,
  onOpenChange,
  transcript,
  mode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transcript: TranscriptRecord | null;
  mode: 'replay' | 'download';
}) {
  const actionCopy = mode === 'replay' ? 'Replay segment' : 'Export transcript';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg space-y-4">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            {actionCopy}: {transcript?.title ?? ''}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            {mode === 'replay'
              ? 'Simulated playback preview of the conversation snippet you selected.'
              : 'Confirm and queue a download for this transcript.'}
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={transcript?.summary ?? ''}
          readOnly
          className="h-32 resize-none border-slate-200/70 bg-slate-100 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200"
        />
        <DialogFooter className="flex justify-between">
          <Button
            variant="ghost"
            className="text-slate-600 hover:text-slate-900 dark:text-slate-300"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            className="bg-sky-500 text-slate-950 hover:bg-sky-400"
            onClick={() => onOpenChange(false)}
          >
            {mode === 'replay' ? 'Play preview' : 'Send export link'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function FilterDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md space-y-4">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            Filter history
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Choose tags or participants to refine your transcript list.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <label className="flex items-center justify-between gap-3">
            <span>Show only strategy sessions</span>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700"
            />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span>Include wellness check-ins</span>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700"
            />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span>Include downloadable attachments</span>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700"
            />
          </label>
        </div>
        <DialogFooter>
          <Button
            className="bg-sky-500 text-slate-950 hover:bg-sky-400"
            onClick={() => onOpenChange(false)}
          >
            Apply filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
