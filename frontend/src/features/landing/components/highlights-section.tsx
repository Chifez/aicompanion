import { Clock, Sparkle, Video } from 'lucide-react';

const highlights = [
  {
    icon: Sparkle,
    title: 'Human-like Presence',
    description:
      'ElevenLabs real-time voice paired with expressive visuals keeps conversations engaging.',
  },
  {
    icon: Video,
    title: 'Cinematic Meetings',
    description:
      'A dedicated meeting room designed for natural two-person interactions.',
  },
  {
    icon: Clock,
    title: 'Instant Responsiveness',
    description: 'Sub-second latency with WebRTC and OpenAI Realtime APIs.',
  },
];

export function HighlightsSection() {
  return (
    <section className="border-y border-slate-200/80 bg-white/80 px-6 py-14 text-slate-900 dark:border-slate-900/80 dark:bg-slate-950/60 dark:text-slate-100 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
        {highlights.map((highlight) => (
          <div
            key={highlight.title}
            className="group rounded-2xl border border-slate-200/60 bg-white/70 p-6 shadow-sm transition hover:border-sky-500/60 hover:bg-slate-50 dark:border-slate-800/60 dark:bg-slate-950/30 dark:hover:bg-slate-900/60"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/15 text-sky-500 ring-1 ring-sky-500/40">
              <highlight.icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {highlight.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {highlight.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
