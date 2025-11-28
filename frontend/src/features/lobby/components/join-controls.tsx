import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface JoinControlsProps {
  joinWithMicrophone: boolean;
  joinWithCamera: boolean;
  onMicrophoneToggle: () => void;
  onCameraToggle: () => void;
  onTestDevices: () => void;
  onJoinMeeting: () => void;
  isJoining: boolean;
  canJoin: boolean;
}

export function JoinControls({
  joinWithMicrophone,
  joinWithCamera,
  onMicrophoneToggle,
  onCameraToggle,
  onTestDevices,
  onJoinMeeting,
  isJoining,
  canJoin,
}: JoinControlsProps) {
  return (
    <section className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200/70 bg-slate-100 px-6 py-5 text-center dark:border-slate-900/60 dark:bg-slate-900/40">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full max-w-xl">
        <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
            <span
              className={`h-2 w-2 rounded-full ${
                joinWithMicrophone ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
            Mic {joinWithMicrophone ? 'On' : 'Off'}
          </div>
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
            <span
              className={`h-2 w-2 rounded-full ${
                joinWithCamera ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
            Camera {joinWithCamera ? 'On' : 'Off'}
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant={joinWithMicrophone ? 'outline' : 'ghost'}
            size="sm"
            onClick={onMicrophoneToggle}
          >
            {joinWithMicrophone ? 'Mute mic on join' : 'Join muted'}
          </Button>
          <Button
            variant={joinWithCamera ? 'outline' : 'ghost'}
            size="sm"
            onClick={onCameraToggle}
          >
            {joinWithCamera ? 'Turn camera off' : 'Join with camera off'}
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-3">
        <Button
          variant="ghost"
          onClick={onTestDevices}
          className="border border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900 dark:border-slate-800/60 dark:text-slate-200 dark:hover:border-slate-700"
        >
          Test devices
        </Button>
        <Button
          disabled={!canJoin || isJoining}
          className="flex items-center gap-2 bg-sky-500 px-6 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-800/60 disabled:text-slate-500"
          onClick={onJoinMeeting}
        >
          {isJoining ? (
            <>
              Joining...
              <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              Join meeting
              <CheckCircle2 className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </section>
  );
}
