import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function SessionStreakCard({
  streak,
}: {
  streak: { day: string; mark: string }[];
}) {
  return (
    <Card className="border-slate-200/70 bg-white shadow-sm dark:border-slate-900/60 dark:bg-slate-950/60">
      <CardHeader>
        <CardTitle className="text-base text-slate-900 dark:text-slate-100">
          Session streak
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Stay consistent with your AI partner to unlock deeper continuity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-500 dark:text-slate-400">
          {streak.map((item, index) => (
            <div
              key={`${item.day}-${index}`}
              className="flex h-12 flex-col items-center justify-center rounded-lg border border-slate-200/70 bg-slate-100 dark:border-slate-900/60 dark:bg-slate-900/60"
            >
              <span className="text-[10px] text-slate-500">{item.day}</span>
              <span className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                {item.mark}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
