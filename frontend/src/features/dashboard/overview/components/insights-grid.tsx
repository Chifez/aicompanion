import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type InsightMetric = {
  title: string;
  value: string;
  delta: string;
  description: string;
};

export function InsightsGrid({ insights }: { insights: InsightMetric[] }) {
  if (insights.length === 0) {
    return (
      <section className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="border-slate-200/70 bg-white shadow-sm dark:border-slate-900/60 dark:bg-slate-950/60"
          >
            <CardHeader>
              <CardDescription className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Metric
              </CardDescription>
              <CardTitle className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                —
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                No data available yet
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
    );
  }

  return (
    <section className="grid gap-6 md:grid-cols-3">
      {insights.map((insight) => {
        const isEmpty =
          insight.value === '0 sessions' ||
          insight.value === '0 highlights' ||
          insight.value === '0%';

        return (
          <Card
            key={insight.title}
            className="border-slate-200/70 bg-white shadow-sm dark:border-slate-900/60 dark:bg-slate-950/60"
          >
            <CardHeader>
              <CardDescription className="text-xs uppercase tracking-[0.3em] text-slate-500">
                {insight.title}
              </CardDescription>
              <div className="flex items-baseline gap-2">
                <CardTitle className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                  {isEmpty ? '—' : insight.value}
                </CardTitle>
                {!isEmpty &&
                  insight.delta !== '+0' &&
                  insight.delta !== '-0' && (
                    <span
                      className={`text-xs ${
                        insight.delta.startsWith('+')
                          ? 'text-emerald-500 dark:text-emerald-400'
                          : 'text-red-500 dark:text-red-400'
                      }`}
                    >
                      {insight.delta}
                    </span>
                  )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {isEmpty ? 'No data available yet' : insight.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
