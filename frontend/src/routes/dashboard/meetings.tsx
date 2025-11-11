import { createFileRoute } from '@tanstack/react-router';
import {
  ArrowRight,
  Calendar,
  Clock,
  MessageCircle,
  Waves,
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

const scheduledMeetings = [
  {
    id: 'mentor-sync',
    title: 'Morning Momentum',
    description:
      'Kickstart your day with tailored prompts and motivational check-in.',
    start: 'Tomorrow · 8:30 AM',
    duration: '25 mins',
    voice: 'Evelyn · Warm Mentor',
  },
  {
    id: 'focus-support',
    title: 'Deep Work Sprint',
    description:
      'AI companion keeps you accountable with timeboxing and recap cues.',
    start: 'Thu · 3:00 PM',
    duration: '45 mins',
    voice: 'Milo · Calm Strategist',
  },
];

const quickStartTemplates = [
  {
    id: 'creative-storm',
    title: 'Creative Partner',
    description: 'Ideate feature concepts, storyboards, and narrative beats.',
    badge: 'Popular',
  },
  {
    id: 'wellness',
    title: 'Wellness Reset',
    description: 'Guided breathwork, mood tracking, and restorative prompts.',
    badge: 'Soothing',
  },
  {
    id: 'retro',
    title: 'Retro Facilitator',
    description:
      'Gather highlights, frictions, and lessons learned with AI moderation.',
    badge: 'Team',
  },
];

export const Route = createFileRoute('/dashboard/meetings')({
  component: MeetingsPage,
});

function MeetingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 text-slate-900 dark:text-slate-100">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Meetings
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Schedule or jump into a realtime session with your AI co-host. Use
          templates to set the tone and objective.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="border-slate-200/70 bg-white shadow-sm dark:border-slate-900/60 dark:bg-slate-950/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base text-slate-900 dark:text-slate-100">
                Scheduled meetings
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Manage upcoming sessions and tweak AI settings.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900 dark:border-slate-800 dark:text-slate-200"
            >
              Create new
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {scheduledMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="rounded-2xl border border-slate-200/70 bg-slate-100 p-4 shadow-sm dark:border-slate-900/60 dark:bg-slate-900/40 sm:flex sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {meeting.title}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {meeting.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-2 py-1 dark:border-slate-800/60">
                      <Calendar className="h-3 w-3" />
                      {meeting.start}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-2 py-1 dark:border-slate-800/60">
                      <Clock className="h-3 w-3" />
                      {meeting.duration}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-2 py-1 dark:border-slate-800/60">
                      <Waves className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                      {meeting.voice}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 sm:mt-0"
                >
                  Adjust settings
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white shadow-sm dark:border-slate-900/60 dark:bg-slate-950/60">
          <CardHeader>
            <CardTitle className="text-base text-slate-900 dark:text-slate-100">
              Session health
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              System checks before you go live.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <HealthItem
              label="Latency"
              status="Low (220ms)"
              icon={<Waves className="h-4 w-4 text-emerald-400" />}
            />
            <HealthItem
              label="OpenAI Realtime"
              status="All nodes online"
              icon={<MessageCircle className="h-4 w-4 text-sky-400" />}
            />
            <HealthItem
              label="ElevenLabs Stream"
              status="Voice synthesis ready"
              icon={<Waves className="h-4 w-4 text-indigo-400" />}
            />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-slate-200/70 bg-white shadow-sm dark:border-slate-900/60 dark:bg-slate-950/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base text-slate-900 dark:text-slate-100">
                Quick start templates
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Shortcut into a tailored meeting format.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {quickStartTemplates.map((template) => (
              <div
                key={template.id}
                className="rounded-xl border border-slate-200/70 bg-slate-100 p-4 shadow-sm dark:border-slate-900/60 dark:bg-slate-900/40"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {template.title}
                  </p>
                  <Badge
                    variant="outline"
                    className="border-slate-300 text-[10px] text-slate-600 dark:border-slate-800/60 dark:text-slate-300"
                  >
                    {template.badge}
                  </Badge>
                </div>
                <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                  {template.description}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                >
                  Launch
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function HealthItem({
  label,
  status,
  icon,
}: {
  label: string;
  status: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-100 px-4 py-3 dark:border-slate-900/60 dark:bg-slate-900/40">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-900/70">
          {icon}
        </div>
        <div className="flex flex-col leading-tight text-slate-700 dark:text-slate-200">
          <span className="text-sm">{label}</span>
          <span className="text-xs text-slate-500">{status}</span>
        </div>
      </div>
      <Badge className="bg-emerald-500/10 text-xs text-emerald-500 dark:text-emerald-300">
        Stable
      </Badge>
    </div>
  );
}
