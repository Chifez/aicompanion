import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PermissionTileProps {
  granted: boolean;
  title: string;
  description: string;
  onRequest: () => void;
}

export function PermissionTile({
  granted,
  title,
  description,
  onRequest,
}: PermissionTileProps) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-slate-100 p-4 dark:border-slate-900/60 dark:bg-slate-900/40">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {title}
        </p>
        {granted ? (
          <Badge className="bg-emerald-500/15 text-[10px] uppercase tracking-[0.25em] text-emerald-300">
            Ready
          </Badge>
        ) : (
          <Badge className="bg-amber-500/15 text-[10px] uppercase tracking-[0.25em] text-amber-300">
            Pending
          </Badge>
        )}
      </div>
      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
        {description}
      </p>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRequest}
        className="mt-3 inline-flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
      >
        {granted ? 'Re-check' : 'Allow access'}
      </Button>
    </div>
  );
}
