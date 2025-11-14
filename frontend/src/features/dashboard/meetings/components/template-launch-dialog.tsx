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

type TemplateLaunchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: { id: string; title: string; description: string } | null;
  onLaunch: () => void;
};

export function TemplateLaunchDialog({
  open,
  onOpenChange,
  template,
  onLaunch,
}: TemplateLaunchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md space-y-4">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            Launch template: {template?.title ?? 'Template'}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            We'll pre-configure the AI companion tone, prompts, and follow-up
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
