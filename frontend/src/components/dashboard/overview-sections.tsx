import { Link } from '@tanstack/react-router';
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

type SessionSpotlightCardProps = {
  quote: string;
  ctaLabel: string;
  onViewTranscript: () => void;
};

export function SessionSpotlightCard({
  quote,
  ctaLabel,
  onViewTranscript,
}: SessionSpotlightCardProps) {
  return (
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
        <p>{quote}</p>
        <Button
          variant="outline"
          size="sm"
          className="border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900 dark:border-slate-800 dark:text-slate-200"
          onClick={onViewTranscript}
        >
          {ctaLabel}
          <ArrowUpRight className="ml-1 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

type UpcomingFocusCardProps = {
  focusItems: Array<{
    icon: 'flame' | 'messages';
    copy: string;
  }>;
};

export function UpcomingFocusCard({ focusItems }: UpcomingFocusCardProps) {
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
        {focusItems.map((item, index) => (
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
        ))}
      </CardContent>
    </Card>
  );
}

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

type SessionSummary = {
  id: string;
  title: string;
  duration: string;
  sentiment: string;
  summary: string;
};

export function RecentSessionsCard({
  sessions,
  onSelectSession,
}: {
  sessions: SessionSummary[];
  onSelectSession: (session: SessionSummary) => void;
}) {
  return (
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
          onClick={() => onSelectSession(sessions[0])}
        >
          See all
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200/70 bg-slate-100 px-4 py-3 text-left transition hover:border-slate-300 hover:bg-slate-200/70 dark:border-slate-900/60 dark:bg-slate-900/40 dark:hover:border-slate-800 dark:hover:bg-slate-900/60"
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
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

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

type StartMeetingCtaProps = {
  onReviewLobby: () => void;
};

export function StartMeetingCta({ onReviewLobby }: StartMeetingCtaProps) {
  return (
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
            Device checks happen in the lobby—one click and you’re in the room.
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
            onClick={onReviewLobby}
          >
            Review lobby settings
          </Button>
        </div>
      </div>
    </section>
  );
}
