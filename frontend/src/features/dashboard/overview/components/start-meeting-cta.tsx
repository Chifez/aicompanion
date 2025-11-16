import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInstantMeeting } from '@/features/dashboard/meetings/hooks/use-instant-meeting';

type StartMeetingCtaProps = {
  onReviewLobby?: () => void;
};

export function StartMeetingCta({ onReviewLobby }: StartMeetingCtaProps) {
  const { startInstantMeeting, isCreating } = useInstantMeeting();

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
            Device checks happen in the lobby—one click and you're in the room.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={startInstantMeeting}
            disabled={isCreating}
            className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Start meeting'}
            <ArrowRight className="h-4 w-4" />
          </Button>
          {onReviewLobby && (
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900 dark:border-slate-800 dark:text-slate-200"
              onClick={onReviewLobby}
            >
              Review lobby settings
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
