import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { SessionSpotlightCard } from './components/session-spotlight-card';
import { UpcomingFocusCard } from './components/upcoming-focus-card';
import { InsightsGrid } from './components/insights-grid';
import { RecentSessionsCard } from './components/recent-sessions-card';
import { SessionStreakCard } from './components/session-streak-card';
import { StartMeetingCta } from './components/start-meeting-cta';
import { SessionDetailDialog } from './components/session-detail-dialog';
import { LobbyNotesDialog } from './components/lobby-notes-dialog';
import { DashboardOverviewSkeleton } from './components/dashboard-overview-skeleton';
import { useDashboardOverview } from './hooks/use-dashboard-overview';
import {
  transformFocusItems,
  transformRecentSessions,
  transformInsights,
  transformStreak,
} from './utils/transform';
import type { DashboardOverviewResponse } from '@/types/api';

export function DashboardOverviewPage() {
  const navigate = useNavigate();
  const [selectedSession, setSelectedSession] = React.useState<
    DashboardOverviewResponse['recentSessions'][number] | null
  >(null);
  const [lobbyNotes, setLobbyNotes] = React.useState('');
  const [isLobbyDialogOpen, setIsLobbyDialogOpen] = React.useState(false);

  const { data, isLoading, isError, error } = useDashboardOverview();

  const focusItems = React.useMemo(() => transformFocusItems(data), [data]);
  const recentSessions = React.useMemo(
    () => transformRecentSessions(data),
    [data]
  );
  const insights = React.useMemo(() => transformInsights(data), [data]);
  const streak = React.useMemo(() => transformStreak(data), [data]);

  if (isLoading) {
    return <DashboardOverviewSkeleton />;
  }

  if (isError) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-4 py-24 text-center text-slate-300">
        <p className="text-lg font-semibold">Unable to load dashboard data.</p>
        <p className="text-sm text-slate-400">
          {(error as Error)?.message ??
            'Please refresh the page or try again later.'}
        </p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <SessionSpotlightCard
          quote={
            data.spotlight.quote ||
            'Your AI companion is ready with a fresh recap.'
          }
          ctaLabel="View transcript"
          onViewTranscript={() => {
            if (data.spotlight.transcriptId) {
              navigate({
                to: '/dashboard/history',
                search: { transcriptId: data.spotlight.transcriptId },
              });
            } else if (data.recentSessions.length) {
              setSelectedSession(data.recentSessions[0]);
            }
          }}
        />
        <UpcomingFocusCard focusItems={focusItems} />
      </header>

      <InsightsGrid insights={insights} />

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <RecentSessionsCard
          sessions={recentSessions}
          onSelectSession={(session) => {
            const full = data.recentSessions.find(
              (item) => item.id === session.id
            );
            if (full) {
              setSelectedSession(full);
            }
          }}
        />
        <SessionStreakCard streak={streak} />
      </section>

      <StartMeetingCta onReviewLobby={() => setIsLobbyDialogOpen(true)} />

      <SessionDetailDialog
        open={Boolean(selectedSession)}
        onOpenChange={(open) => !open && setSelectedSession(null)}
        session={selectedSession}
      />

      <LobbyNotesDialog
        open={isLobbyDialogOpen}
        onOpenChange={setIsLobbyDialogOpen}
        notes={lobbyNotes}
        onNotesChange={setLobbyNotes}
      />
    </div>
  );
}
