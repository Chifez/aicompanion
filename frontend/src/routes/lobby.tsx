import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Toggle } from '@/components/ui/toggle';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Loader2,
  Mic,
  RefreshCcw,
} from 'lucide-react';

const mockPermissions = {
  microphone: true,
  camera: false,
};

const connectionChecklist = [
  { label: 'WebRTC handshake', status: 'ready' },
  { label: 'OpenAI realtime API', status: 'ready' },
  { label: 'ElevenLabs stream', status: 'ready' },
  { label: 'Redis signaling bus', status: 'ready' },
];

export const Route = createFileRoute('/lobby')({
  component: LobbyPage,
});

function LobbyPage() {
  const navigate = useNavigate();
  const permissionsGranted =
    mockPermissions.microphone && mockPermissions.camera;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col gap-10 px-6 py-12 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col gap-2 text-center">
        <Badge className="mx-auto bg-slate-200 text-xs uppercase tracking-[0.3em] text-slate-600 dark:bg-slate-900 dark:text-slate-400">
          Session lobby
        </Badge>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50">
          Check your setup before joining
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Allow microphone and camera so your AI companion can mirror your
          presence in real time.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-slate-200/70 bg-white shadow-sm dark:border-slate-900/60 dark:bg-slate-950/60">
          <CardHeader>
            <CardTitle className="text-base text-slate-900 dark:text-slate-100">
              Device preview
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Grant permissions and confirm your environment before joining.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-100 dark:border-slate-900/60 dark:bg-slate-900/50">
              {mockPermissions.camera ? (
                <div className="flex h-full items-center justify-center text-slate-500">
                  <Camera className="mr-2 h-6 w-6" />
                  Camera active
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500">
                  <Camera className="h-8 w-8" />
                  <p className="text-sm">Camera permission needed</p>
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <PermissionTile
                granted={mockPermissions.microphone}
                title="Microphone"
                description="Allow mic to enable your voice in the session."
              />
              <PermissionTile
                granted={mockPermissions.camera}
                title="Camera"
                description="Share your video to feel present in the room."
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-100 px-4 py-3 dark:border-slate-900/60 dark:bg-slate-900/40">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Spatial audio mode
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Immersive mix for headphones.
                </p>
              </div>
              <Toggle className="data-[state=on]:bg-sky-500 data-[state=on]:text-slate-950">
                Enable
              </Toggle>
            </div>
          </CardContent>
        </Card>

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
            {connectionChecklist.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-100 px-3 py-2 dark:border-slate-900/60 dark:bg-slate-900/40"
              >
                <span className="text-sm text-slate-700 dark:text-slate-200">
                  {item.label}
                </span>
                <span className="inline-flex items-center gap-2 text-xs text-emerald-500 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  {item.status}
                </span>
              </div>
            ))}
            <Dialog>
              <DialogContent className="border-slate-200/70 bg-white text-slate-900 dark:border-slate-900/60 dark:bg-slate-950 dark:text-slate-100">
                <DialogHeader>
                  <DialogTitle className="text-slate-900 dark:text-slate-100">
                    Need a reset?
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Clear cached device permissions and refresh the signaling
                  layer. This is helpful if your browser keeps a stale state
                  after switching hardware.
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
      </div>

      <section className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200/70 bg-slate-100 px-6 py-5 text-center dark:border-slate-900/60 dark:bg-slate-900/40">
        {permissionsGranted ? (
          <span className="inline-flex items-center gap-2 text-sm text-emerald-500 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            All permissions granted. You’re ready to join.
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 text-sm text-amber-300">
            <AlertTriangle className="h-4 w-4" />
            Allow both microphone and camera to proceed.
          </span>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          <Button
            variant="ghost"
            className="border border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900 dark:border-slate-800/60 dark:text-slate-200 dark:hover:border-slate-700"
          >
            Test devices
          </Button>
          <Button
            disabled={!permissionsGranted}
            className="flex items-center gap-2 bg-sky-500 px-6 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-800/60 disabled:text-slate-500"
            onClick={() => navigate({ to: '/meeting' })}
          >
            Join meeting
            {permissionsGranted ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}

function PermissionTile({
  granted,
  title,
  description,
}: {
  granted: boolean;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-slate-100 p-4 dark:border-slate-900/60 dark:bg-slate-900/40">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {title}
        </p>
        {granted ? (
          <Badge className="bg-emerald-500/15 text-[10px] uppercase tracking-[0.25em] text-emerald-300">
            Ready
          </Badge>
        ) : (
          <Badge className="bg-amber-500/15 text-[10px] uppercase tracking-[0.25em] text-amber-300">
            Pending
          </Badge>
        )}
      </div>
      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
        {description}
      </p>
      <Button
        variant="ghost"
        size="sm"
        className="mt-3 inline-flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
      >
        {granted ? 'Re-check' : 'Allow access'}
      </Button>
    </div>
  );
}
