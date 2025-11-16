import { Calendar, Clock, Edit, Play, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatDuration, formatStartTime } from '../utils/format';
import type { ScheduledMeeting } from '../utils/transform';

type ScheduledMeetingsCardProps = {
  meetings: ScheduledMeeting[];
  onCreate: () => void;
  onAdjust: (meeting: ScheduledMeeting) => void;
  onStart: (meeting: ScheduledMeeting) => void;
};

export function ScheduledMeetingsCard({
  meetings,
  onCreate,
  onAdjust,
  onStart,
}: ScheduledMeetingsCardProps) {
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
        {meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No scheduled meetings
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Create your first meeting to get started
            </p>
          </div>
        ) : (
          meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="relative rounded-2xl border border-slate-200/70 bg-slate-100 p-4 shadow-sm transition hover:border-slate-300 hover:bg-slate-200/70 dark:border-slate-900/60 dark:bg-slate-900/40 dark:hover:border-slate-800 dark:hover:bg-slate-900/60"
            >
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                onClick={() => onAdjust(meeting)}
                title="Edit meeting"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <div className="flex flex-col gap-1 pr-8">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {meeting.title}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {meeting.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-2 py-1 dark:border-slate-800/60">
                    <Calendar className="h-3 w-3" />
                    {formatStartTime(meeting.startTime)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-2 py-1 dark:border-slate-800/60">
                    <Clock className="h-3 w-3" />
                    {formatDuration(meeting.durationMinutes)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-2 py-1 dark:border-slate-800/60">
                    <Waves className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                    {meeting.voiceProfile || 'Default voice'}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  size="sm"
                  className="w-full inline-flex items-center justify-center gap-1 bg-sky-500 text-slate-950 hover:bg-sky-400 sm:w-auto"
                  onClick={() => onStart(meeting)}
                >
                  <Play className="h-3.5 w-3.5" />
                  Start meeting
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
