import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type PresetsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presets: string[];
};

export function PresetsDialog({
  open,
  onOpenChange,
  presets,
}: PresetsDialogProps) {
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
