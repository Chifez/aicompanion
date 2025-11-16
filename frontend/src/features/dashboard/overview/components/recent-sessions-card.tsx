import { Clock3 } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type SessionSummary = {
  id: string;
  title: string;
  duration: string;
  sentiment: string;
  summary: string;
};

export function RecentSessionsCard({
  sessions,
  onSelectSession,
}: {
  sessions: SessionSummary[];
  onSelectSession: (session: SessionSummary) => void;
}) {
  return (
    <Card className="border-slate-200/70 bg-white shadow-sm dark:border-slate-900/60 dark:bg-slate-950/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base text-slate-900 dark:text-slate-100">
            Recent sessions
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Continue where you left off with your AI companion.
          </CardDescription>
        </div>
        <Link to="/dashboard/history">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          >
            See all
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No recent sessions
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Your session history will appear here
            </p>
          </div>
        ) : (
          sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200/70 bg-slate-100 px-4 py-3 text-left transition hover:border-slate-300 hover:bg-slate-200/70 dark:border-slate-900/60 dark:bg-slate-900/40 dark:hover:border-slate-800 dark:hover:bg-slate-900/60"
            >
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {session.title}
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  {session.summary}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-2 py-1 dark:border-slate-800/60">
                  <Clock3 className="h-3 w-3" />
                  {session.duration}
                </span>
                <span className="capitalize text-slate-500">
                  {session.sentiment}
                </span>
              </div>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}
