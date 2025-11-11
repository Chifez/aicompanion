import { Link, createFileRoute } from '@tanstack/react-router';
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Flame,
  MessagesSquare,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const sessions = [
  {
    id: 'focus-boost',
    title: 'Productivity Sprint',
    duration: '32 mins',
    sentiment: 'positive',
    summary:
      'Reviewed sprint goals, aligned on blockers, prioritized follow-ups.',
  },
  {
    id: 'wellness-check',
    title: 'Evening Reset',
    duration: '18 mins',
    sentiment: 'calm',
    summary: 'Guided breathing and reflection on today’s wins and lessons.',
  },
];

const insights = [
  {
    title: 'AI presence score',
    value: '92',
    delta: '+5.2',
    description:
      'Consistency of tone and responsiveness over the past 7 sessions.',
  },
  {
    title: 'Average response time',
    value: '240ms',
    delta: '-8ms',
    description: 'Median latency across full-duplex conversations this week.',
  },
  {
    title: 'Conversation depth',
    value: '14.6',
    delta: '+1.2',
    description: 'Average turns per meeting before an actionable outcome.',
  },
];

const streak = [
  { day: 'Mon', mark: '✓' },
  { day: 'Tue', mark: '•' },
  { day: 'Wed', mark: '✓' },
  { day: 'Thu', mark: '✓' },
  { day: 'Fri', mark: '•' },
  { day: 'Sat', mark: '✓' },
  { day: 'Sun', mark: '•' },
  { day: 'Mon', mark: '✓' },
  { day: 'Tue', mark: '✓' },
  { day: 'Wed', mark: '•' },
  { day: 'Thu', mark: '✓' },
  { day: 'Fri', mark: '✓' },
  { day: 'Sat', mark: '•' },
  { day: 'Sun', mark: '✓' },
];

function DashboardHome() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-slate-200/70 bg-white shadow-sm dark:border-slate-900/60 dark:bg-slate-950/60">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-xl text-slate-900 dark:text-slate-100">
                Session spotlight
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Your AI co-host distilled actionable takeaways from yesterday’s
                conversation.
              </CardDescription>
            </div>
            <Badge className="bg-slate-200 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
              <Sparkles className="mr-1 h-3 w-3" />
              Fresh
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <p>
              “Focus on shifting the Q4 roadmap discussion to next week’s async
              doc. AI companion already prepared a draft summary with open
              questions for the team.”
            </p>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900 dark:border-slate-800 dark:text-slate-200"
            >
              View transcript
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
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
            <div className="flex items-center gap-3 rounded-lg border border-slate-200/70 bg-slate-100 px-3 py-2 dark:border-slate-800/60 dark:bg-slate-900/50">
              <Flame className="h-4 w-4 text-orange-500 dark:text-orange-400" />
              Sharpen messaging for launch recap.
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-slate-200/70 bg-slate-100 px-3 py-2 dark:border-slate-800/60 dark:bg-slate-900/50">
              <MessagesSquare className="h-4 w-4 text-sky-500 dark:text-sky-400" />
              Prompt the AI to recap stakeholder tone for better mirroring.
            </div>
          </CardContent>
        </Card>
      </header>

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

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
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
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            >
              See all
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-100 px-4 py-3 dark:border-slate-900/60 dark:bg-slate-900/40"
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
              </div>
            ))}
          </CardContent>
        </Card>

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
                  key={index}
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
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-900/60 dark:bg-slate-950/60">
        <div className="flex flex-col gap-4 text-slate-900 dark:text-slate-100 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">
              Ready to collaborate
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Launch a live session with your AI co-host
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Device checks happen in the lobby—one click and you’re in the
              room.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/lobby"
              className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-slate-950 transition hover:bg-sky-400"
            >
              Start meeting
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900 dark:border-slate-800 dark:text-slate-200"
            >
              Review lobby settings
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export const Route = createFileRoute('/dashboard/')({
  component: DashboardHome,
});
