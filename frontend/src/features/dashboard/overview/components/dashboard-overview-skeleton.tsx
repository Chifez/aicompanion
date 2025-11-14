import { Skeleton } from '@/components/ui/skeleton';

export function DashboardOverviewSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Skeleton className="h-64 rounded-3xl bg-slate-800/50" />
        <Skeleton className="h-64 rounded-3xl bg-slate-800/50" />
      </section>
      <section className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-44 rounded-3xl bg-slate-800/50" />
        <Skeleton className="h-44 rounded-3xl bg-slate-800/50" />
        <Skeleton className="h-44 rounded-3xl bg-slate-800/50" />
      </section>
      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-72 rounded-3xl bg-slate-800/50" />
        <Skeleton className="h-72 rounded-3xl bg-slate-800/50" />
      </section>
      <Skeleton className="h-48 rounded-3xl bg-slate-800/50" />
    </div>
  );
}
