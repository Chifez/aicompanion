import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type FilterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FilterDialog({ open, onOpenChange }: FilterDialogProps) {
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
      </DialogContent>
    </Dialog>
  );
}
