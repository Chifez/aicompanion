import { Skeleton } from '@/components/ui/skeleton';

export function MeetingsSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <Skeleton className="h-20 w-1/2 rounded-3xl bg-slate-800/50" />
      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-72 rounded-3xl bg-slate-800/50" />
        <Skeleton className="h-72 rounded-3xl bg-slate-800/50" />
      </section>
      <Skeleton className="h-48 rounded-3xl bg-slate-800/50" />
    </div>
  );
}
