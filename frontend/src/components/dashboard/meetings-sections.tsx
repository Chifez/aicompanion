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

export type ScheduledMeeting = {
  id: string;
  title: string;
  description: string;
  start: string;
  duration: string;
  voice: string;
};

type QuickStartTemplate = {
  id: string;
  title: string;
  description: string;
  badge: string;
};

export function ScheduledMeetingsCard({
  meetings,
  onCreate,
  onAdjust,
}: {
  meetings: ScheduledMeeting[];
  onCreate: () => void;
  onAdjust: (meeting: ScheduledMeeting) => void;
}) {
  return (
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
          onClick={onCreate}
        >
          Create new
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className="rounded-2xl border border-slate-200/70 bg-slate-100 p-4 shadow-sm transition hover:border-slate-300 hover:bg-slate-200/70 dark:border-slate-900/60 dark:bg-slate-900/40 dark:hover:border-slate-800 dark:hover:bg-slate-900/60 sm:flex sm:items-center sm:justify-between"
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
              onClick={() => onAdjust(meeting)}
            >
              Adjust settings
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function SessionHealthCard({
  healthItems,
}: {
  healthItems: Array<{ label: string; status: string; icon: React.ReactNode }>;
}) {
  return (
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
        {healthItems.map((item) => (
          <HealthItem key={item.label} {...item} />
        ))}
      </CardContent>
    </Card>
  );
}

export function QuickStartTemplatesCard({
  templates,
  onLaunch,
}: {
  templates: QuickStartTemplate[];
  onLaunch: (template: QuickStartTemplate) => void;
}) {
  return (
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
        {templates.map((template) => (
          <div
            key={template.id}
            className="rounded-xl border border-slate-200/70 bg-slate-100 p-4 shadow-sm transition hover:border-slate-300 hover:bg-slate-200/70 dark:border-slate-900/60 dark:bg-slate-900/40 dark:hover:border-slate-800 dark:hover:bg-slate-900/60"
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
              onClick={() => onLaunch(template)}
            >
              Launch
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
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
