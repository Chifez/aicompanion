import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

type ExportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transcriptTitle?: string;
  isBulkExport?: boolean;
  onConfirm: () => void;
};

export function ExportDialog({
  open,
  onOpenChange,
  transcriptTitle,
  isBulkExport = false,
  onConfirm,
}: ExportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md space-y-4">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            {isBulkExport ? 'Export all transcripts' : 'Export transcript'}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            {isBulkExport
              ? 'A secure download link will be generated for your entire transcript history. You will receive an email when the export is ready.'
              : `Generate a secure download link for "${transcriptTitle}". You will receive an email when the export is ready.`}
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-slate-200/70 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex items-start gap-3">
            <Download className="h-5 w-5 text-sky-500" />
            <div className="flex-1 space-y-1 text-sm">
              <p className="font-medium text-slate-900 dark:text-slate-100">
                Export format
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Transcripts will be exported as a ZIP file containing JSON and
                markdown formats.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-300"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="bg-sky-500 text-slate-950 hover:bg-sky-400"
          >
            Queue export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
