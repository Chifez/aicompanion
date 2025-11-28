import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type HealthItem = {
  label: string;
  status: string;
  icon: React.ReactNode;
};

type SessionHealthCardProps = {
  healthItems: HealthItem[];
};

export function SessionHealthCard({ healthItems }: SessionHealthCardProps) {
  const hasData =
    healthItems.length > 0 &&
    healthItems.some((item) => {
      // Check if item has meaningful data (not "0% / 0%", "0 ms", "0 · neutral")
      if (
        item.status.includes('0% / 0%') ||
        item.status === '0 ms' ||
        item.status.startsWith('0 ·')
      ) {
        return false;
      }
      return true;
    });

  return (
    <Card className="border-slate-200/70 bg-white shadow-sm dark:border-slate-900/60 dark:bg-slate-950/60">
      <CardHeader>
        <CardTitle className="text-base text-slate-900 dark:text-slate-100">
          Session health
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          System checks before you go live.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No session data yet
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Metrics will appear after your first meeting
            </p>
          </div>
        ) : (
          healthItems.map((item) => <HealthItem key={item.label} {...item} />)
        )}
      </CardContent>
    </Card>
  );
}

function HealthItem({ label, status, icon }: HealthItem) {
  // Check if this is empty/zero data
  const isEmpty =
    status.includes('0% / 0%') || status === '0 ms' || status.startsWith('0 ·');

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-100 px-4 py-3 dark:border-slate-900/60 dark:bg-slate-900/40">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-900/70">
          {icon}
        </div>
        <div className="flex flex-col leading-tight text-slate-700 dark:text-slate-200">
          <span className="text-sm">{label}</span>
          <span className="text-xs text-slate-500">
            {isEmpty ? 'No data' : status}
          </span>
        </div>
      </div>
      {!isEmpty && (
        <Badge className="bg-emerald-500/10 text-xs text-emerald-500 dark:text-emerald-300">
          Stable
        </Badge>
      )}
    </div>
  );
}
