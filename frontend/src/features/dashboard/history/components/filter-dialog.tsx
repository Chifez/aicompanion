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

type FilterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    strategyOnly: boolean;
    includeWellness: boolean;
    includeAttachments: boolean;
  };
  onFiltersChange: (filters: {
    strategyOnly: boolean;
    includeWellness: boolean;
    includeAttachments: boolean;
  }) => void;
};

export function FilterDialog({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
}: FilterDialogProps) {
  const [localFilters, setLocalFilters] = React.useState(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    const resetFilters = {
      strategyOnly: false,
      includeWellness: true,
      includeAttachments: true,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

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
              checked={localFilters.strategyOnly}
              onChange={(e) =>
                setLocalFilters({
                  ...localFilters,
                  strategyOnly: e.target.checked,
                })
              }
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700"
            />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span>Include wellness check-ins</span>
            <input
              type="checkbox"
              checked={localFilters.includeWellness}
              onChange={(e) =>
                setLocalFilters({
                  ...localFilters,
                  includeWellness: e.target.checked,
                })
              }
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700"
            />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span>Include downloadable attachments</span>
            <input
              type="checkbox"
              checked={localFilters.includeAttachments}
              onChange={(e) =>
                setLocalFilters({
                  ...localFilters,
                  includeAttachments: e.target.checked,
                })
              }
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700"
            />
          </label>
        </div>
        <DialogFooter className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-300"
          >
            Reset
          </Button>
          <Button
            onClick={handleApply}
            className="bg-sky-500 text-slate-950 hover:bg-sky-400"
          >
            Apply filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
