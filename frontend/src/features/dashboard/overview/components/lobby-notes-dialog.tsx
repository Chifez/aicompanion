import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

type LobbyNotesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
};

export function LobbyNotesDialog({
  open,
  onOpenChange,
  notes,
  onNotesChange,
}: LobbyNotesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md space-y-4">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            Lobby checklist
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Capture reminders or preferences before you launch the next live
            meeting.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={notes}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
            onNotesChange(event.target.value)
          }
          placeholder="E.g. remind me to enable spatial audio, use Aurora voice preset..."
          className="h-32 resize-none border-slate-200/70 bg-slate-100 text-sm text-slate-700 placeholder:text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200"
        />
      </DialogContent>
    </Dialog>
  );
}
