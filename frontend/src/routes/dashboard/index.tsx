import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  SessionSpotlightCard,
  UpcomingFocusCard,
  InsightsGrid,
  RecentSessionsCard,
  SessionStreakCard,
  StartMeetingCta,
} from '@/components/dashboard/overview-sections';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

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
  const [selectedSession, setSelectedSession] = React.useState<
    (typeof sessions)[number] | null
  >(null);
  const [lobbyNotes, setLobbyNotes] = React.useState('');
  const [isLobbyDialogOpen, setIsLobbyDialogOpen] = React.useState(false);

  const focusItems = [
    { icon: 'flame' as const, copy: 'Sharpen messaging for launch recap.' },
    {
      icon: 'messages' as const,
      copy: 'Prompt the AI to recap stakeholder tone for better mirroring.',
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <SessionSpotlightCard
          quote="“Focus on shifting the Q4 roadmap discussion to next week’s async doc. AI companion already prepared a draft summary with open questions for the team.”"
          ctaLabel="View transcript"
          onViewTranscript={() => setSelectedSession(sessions[0])}
        />
        <UpcomingFocusCard focusItems={focusItems} />
      </header>

      <InsightsGrid insights={insights} />

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <RecentSessionsCard
          sessions={sessions}
          onSelectSession={setSelectedSession}
        />
        <SessionStreakCard streak={streak} />
      </section>

      <StartMeetingCta onReviewLobby={() => setIsLobbyDialogOpen(true)} />

      <Dialog
        open={Boolean(selectedSession)}
        onOpenChange={(open) => !open && setSelectedSession(null)}
      >
        <DialogContent className="max-w-lg space-y-4">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">
              {selectedSession?.title ?? 'Session details'}
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              {selectedSession?.summary ??
                'Review the latest AI companion summary and next steps.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>
              Duration:{' '}
              <span className="font-medium">{selectedSession?.duration}</span>
            </p>
            <p>
              Sentiment:{' '}
              <span className="capitalize">{selectedSession?.sentiment}</span>
            </p>
          </div>
          <Textarea
            value={selectedSession?.summary ?? ''}
            readOnly
            className="h-40 resize-none border-slate-200/70 bg-slate-100 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isLobbyDialogOpen} onOpenChange={setIsLobbyDialogOpen}>
        <DialogContent className="max-w-md space-y-4">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">
              Lobby checklist
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Capture reminders or preferences before you launch the next live
              meeting.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={lobbyNotes}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
              setLobbyNotes(event.target.value)
            }
            placeholder="E.g. remind me to enable spatial audio, use Aurora voice preset..."
            className="h-32 resize-none border-slate-200/70 bg-slate-100 text-sm text-slate-700 placeholder:text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute('/dashboard/')({
  component: DashboardHome,
});
