import { createFileRoute } from '@tanstack/react-router';
import {
  Flame,
  Mic,
  Monitor,
  PhoneOff,
  Settings,
  Signal,
  Smile,
  Volume2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const controlItems = [
  { id: 'mic', label: 'Mute', icon: Mic },
  { id: 'speaker', label: 'Audio', icon: Volume2 },
  { id: 'camera', label: 'Camera', icon: Monitor },
  { id: 'mood', label: 'Tone', icon: Smile },
  { id: 'energy', label: 'Energy', icon: Flame },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Route = createFileRoute('/meeting')({
  component: MeetingRoom,
});

function MeetingRoom() {
  const aiPresence = {
    name: 'Aurora',
    mood: 'Supportive',
    voice: 'Evelyn · Warm Alto',
    prompt:
      '“Ready when you are. What would you like to focus on first today?”',
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200/70 bg-white/90 px-8 py-5 dark:border-slate-900/60 dark:bg-slate-950/80">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Live session
          </p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-50">
            Momentum Check-In
          </h1>
        </div>
        <Badge className="flex items-center gap-2 bg-emerald-500/15 text-emerald-500 dark:text-emerald-300">
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
          Connected
        </Badge>
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-8">
        <div className="relative flex w-full max-w-5xl flex-col items-center gap-6">
          <Card className="relative aspect-video w-full overflow-hidden border border-slate-200/70 bg-slate-100 shadow-[0_0_90px_rgba(14,165,233,0.1)] dark:border-slate-900/60 dark:bg-slate-900/50">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.2)_0%,rgba(15,23,42,0.85)_60%)] dark:bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.2)_0%,rgba(15,23,42,0.9)_60%)]" />
            <div className="relative flex h-full flex-col justify-end p-6">
              <div className="mb-6 flex items-center gap-3">
                <Avatar className="h-12 w-12 border border-slate-300 dark:border-slate-800/80">
                  <AvatarImage
                    src="https://avatar.vercel.sh/aurora"
                    alt="Aurora avatar"
                  />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {aiPresence.name}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {aiPresence.voice} · {aiPresence.mood} tone
                  </p>
                </div>
              </div>
              <p className="rounded-2xl bg-slate-200/80 px-4 py-3 text-sm text-slate-700 shadow-lg shadow-sky-200/40 dark:bg-slate-900/70 dark:text-slate-200 dark:shadow-sky-900/20">
                {aiPresence.prompt}
              </p>
            </div>
          </Card>

          <div className="absolute bottom-8 left-8 w-48 rounded-2xl border border-slate-200/70 bg-slate-100 p-3 shadow-lg dark:border-slate-900/60 dark:bg-slate-900/70">
            <div className="aspect-video w-full overflow-hidden rounded-xl border border-slate-200/80 bg-slate-200 dark:border-slate-800/70 dark:bg-slate-800/50" />
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
              You · Camera on
            </p>
          </div>
        </div>
      </main>

      <section className="sticky bottom-0 z-20 flex flex-col items-center gap-4 border-t border-slate-200/70 bg-white/85 px-6 py-5 text-slate-700 backdrop-blur dark:border-slate-900/60 dark:bg-slate-950/90 dark:text-slate-400">
        <div className="flex items-center gap-3 rounded-full border border-slate-200/70 bg-slate-100 px-5 py-3 text-xs dark:border-slate-900/60 dark:bg-slate-900/40">
          <Signal className="mr-2 h-4 w-4 text-emerald-500 dark:text-emerald-300" />
          Connection optimal · 220ms latency · Streaming 48kHz audio
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {controlItems.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full border border-slate-200/70 bg-slate-100 text-slate-700 hover:border-slate-300 hover:bg-slate-200 dark:border-slate-900/60 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800/80"
                >
                  <item.icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="border-slate-200/70 bg-white text-slate-700 dark:border-slate-900/60 dark:bg-slate-950 dark:text-slate-200">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
          <Button className="inline-flex h-12 items-center gap-2 rounded-full bg-red-500 px-5 text-sm font-semibold text-slate-50 hover:bg-red-400">
            <PhoneOff className="h-4 w-4" />
            Leave
          </Button>
        </div>
      </section>
    </div>
  );
}
