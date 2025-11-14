import { Skeleton } from '@/components/ui/skeleton';

export function SettingsSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <Skeleton className="h-20 rounded-3xl bg-slate-800/50" />
      <Skeleton className="h-56 rounded-3xl bg-slate-800/50" />
      <Skeleton className="h-56 rounded-3xl bg-slate-800/50" />
      <Skeleton className="h-48 rounded-3xl bg-slate-800/50" />
    </div>
  );
}
