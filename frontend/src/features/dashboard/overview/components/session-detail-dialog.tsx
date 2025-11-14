import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type { DashboardOverviewResponse } from '@/types/api';
import { formatMinutes } from '../utils/format';

type SessionDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: DashboardOverviewResponse['recentSessions'][number] | null;
};

export function SessionDetailDialog({
  open,
  onOpenChange,
  session,
}: SessionDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg space-y-4">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            {session?.title ?? 'Session details'}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            {session?.actionSummary ??
              'Review the latest AI companion summary and next steps.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p>
            Duration:{' '}
            <span className="font-medium">
              {session ? formatMinutes(session.durationMinutes) : '—'}
            </span>
          </p>
          <p>
            Sentiment:{' '}
            <span className="capitalize">
              {session?.sentiment ?? 'neutral'}
            </span>
          </p>
        </div>
        <Textarea
          value={session?.actionSummary ?? ''}
          readOnly
          className="h-40 resize-none border-slate-200/70 bg-slate-100 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200"
        />
      </DialogContent>
    </Dialog>
  );
}
