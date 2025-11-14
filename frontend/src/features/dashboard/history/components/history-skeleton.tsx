import { Skeleton } from '@/components/ui/skeleton';

export function HistorySkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <Skeleton className="h-20 rounded-3xl bg-slate-800/50" />
      <Skeleton className="h-32 rounded-3xl bg-slate-800/50" />
      <Skeleton className="h-32 rounded-3xl bg-slate-800/50" />
      <Skeleton className="h-32 rounded-3xl bg-slate-800/50" />
    </div>
  );
}
