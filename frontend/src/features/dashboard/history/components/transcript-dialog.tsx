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
import type { TranscriptRecord } from '../types';

type TranscriptDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transcript: TranscriptRecord | null;
  mode: 'replay' | 'download';
};

export function TranscriptDialog({
  open,
  onOpenChange,
  transcript,
  mode,
}: TranscriptDialogProps) {
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
