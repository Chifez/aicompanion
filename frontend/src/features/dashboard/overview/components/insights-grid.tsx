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
  return (
    <section className="grid gap-6 md:grid-cols-3">
      {insights.map((insight) => (
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
                {insight.value}
              </CardTitle>
              <span className="text-xs text-emerald-500 dark:text-emerald-400">
                {insight.delta}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {insight.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
