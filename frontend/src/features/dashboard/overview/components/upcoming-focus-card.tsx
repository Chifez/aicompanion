import { Flame, MessagesSquare } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type UpcomingFocusCardProps = {
  focusItems: Array<{
    icon: 'flame' | 'messages';
    copy: string;
  }>;
};

export function UpcomingFocusCard({ focusItems }: UpcomingFocusCardProps) {
  const hasData =
    focusItems.length > 0 &&
    focusItems.some(
      (item) =>
        item.copy &&
        item.copy.trim() !== '' &&
        !item.copy.includes('Upcoming session')
    );

  return (
    <Card className="border-slate-200/70 bg-white shadow-sm dark:border-slate-900/60 dark:bg-slate-950/60">
      <CardHeader>
        <CardTitle className="text-base text-slate-900 dark:text-slate-100">
          Upcoming focus
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          AI partner suggestions for your next live session.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No upcoming meetings
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Schedule a meeting to see it here
            </p>
          </div>
        ) : (
          focusItems.map((item, index) => (
            <div
              key={`${item.copy}-${index}`}
              className="flex items-center gap-3 rounded-lg border border-slate-200/70 bg-slate-100 px-3 py-2 dark:border-slate-800/60 dark:bg-slate-900/50"
            >
              {item.icon === 'flame' ? (
                <Flame className="h-4 w-4 text-orange-500 dark:text-orange-400" />
              ) : (
                <MessagesSquare className="h-4 w-4 text-sky-500 dark:text-sky-400" />
              )}
              {item.copy}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
