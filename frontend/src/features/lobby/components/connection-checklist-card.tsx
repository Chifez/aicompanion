import { CheckCircle2, RefreshCcw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ConnectionChecklistCardProps {
  connectionStatus: {
    webrtc: boolean;
    openai: boolean;
    elevenlabs: boolean;
    redis: boolean;
  };
}

export function ConnectionChecklistCard({
  connectionStatus,
}: ConnectionChecklistCardProps) {
  return (
    <Card className="border-slate-200/70 bg-white shadow-sm dark:border-slate-900/60 dark:bg-slate-950/60">
      <CardHeader>
        <CardTitle className="text-base text-slate-900 dark:text-slate-100">
          Connection checklist
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          All systems must be green to enter the room.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          { label: 'WebRTC handshake', key: 'webrtc' as const },
          { label: 'OpenAI realtime API', key: 'openai' as const },
          { label: 'ElevenLabs stream', key: 'elevenlabs' as const },
          { label: 'Redis signaling bus', key: 'redis' as const },
        ].map((item) => {
          const isReady = connectionStatus[item.key];
          return (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-100 px-3 py-2 dark:border-slate-900/60 dark:bg-slate-900/40"
            >
              <span className="text-sm text-slate-700 dark:text-slate-200">
                {item.label}
              </span>
              <span
                className={`inline-flex items-center gap-2 text-xs ${
                  isReady
                    ? 'text-emerald-500 dark:text-emerald-300'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                {isReady ? 'ready' : 'pending'}
              </span>
            </div>
          );
        })}
        <Dialog>
          <DialogContent className="border-slate-200/70 bg-white text-slate-900 dark:border-slate-900/60 dark:bg-slate-950 dark:text-slate-100">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-slate-100">
                Need a reset?
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Clear cached device permissions and refresh the signaling layer.
              This is helpful if your browser keeps a stale state after
              switching hardware.
            </p>
            <Button className="mt-4 bg-slate-200 text-slate-900 hover:bg-slate-100">
              Hard reset
            </Button>
          </DialogContent>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Troubleshooting
          </Button>
        </Dialog>
      </CardContent>
    </Card>
  );
}
