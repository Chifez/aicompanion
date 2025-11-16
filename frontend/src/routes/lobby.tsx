import * as React from 'react';
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
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
import { Camera, CheckCircle2, Loader2, RefreshCcw } from 'lucide-react';
import { useMeetingJoin } from '@/features/dashboard/meetings/hooks/use-meeting-join';
import { toast } from 'sonner';
import { useMeetingDetail } from '@/features/dashboard/meetings/hooks/use-meeting-detail';
import { useMediaStreams } from '@/hooks/use-media-streams';
import { useVideoPreview } from '@/hooks/use-video-preview';
import { useConnectionStatus } from '@/hooks/use-connection-status';
import { useAuthStore } from '@/stores/auth-store';
import { apiClient } from '@/lib/api-client';

export const Route = createFileRoute('/lobby')({
  component: LobbyPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      meetingId: (search.meetingId as string) || null,
    };
  },
});

function LobbyPage() {
  const navigate = useNavigate();
  const { meetingId } = useSearch({ from: '/lobby' });
  const meetingDetailQuery = useMeetingDetail(meetingId);
  const joinMeeting = useMeetingJoin();
  const userId = useAuthStore((state) => state.session?.user.id ?? null);

  const [spatialAudio, setSpatialAudio] = React.useState(false);
  const [joinWithMicrophone, setJoinWithMicrophone] = React.useState(true);
  const [joinWithCamera, setJoinWithCamera] = React.useState(true);

  const {
    permissions,
    cameraStream,
    audioStream,
    checkPermissions,
    requestMicrophone,
    requestCamera,
    testDevices,
  } = useMediaStreams();

  const videoRef = useVideoPreview(cameraStream);

  const connectionStatus = useConnectionStatus({
    enabled: Boolean(meetingId && meetingDetailQuery.data),
  });

  // Check browser permissions on mount
  React.useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const handleJoinMeeting = async () => {
    if (!meetingId) {
      console.error('No meeting ID provided');
      return;
    }

    try {
      const meeting = meetingDetailQuery.data;
      const isHost = meeting && userId && meeting.summary.hostUserId === userId;
      const status = meeting?.summary.status;

      // If host is joining a scheduled meeting, start it first
      if (isHost && status === 'scheduled') {
        await apiClient.post(`/meetings/${meetingId}/start`);
      }

      const joinData = await joinMeeting.mutateAsync(meetingId);
      // Store tokens and streams for meeting room
      if (joinData) {
        localStorage.setItem('meetingTokens', JSON.stringify(joinData));
        // Persist join preferences for the meeting room
        localStorage.setItem(
          'meetingJoinPrefs',
          JSON.stringify({
            audioEnabled: joinWithMicrophone,
            videoEnabled: joinWithCamera,
          })
        );
        // Store stream references (they'll be passed to meeting room)
        if (cameraStream) {
          // Stream will continue in meeting room
        }
        if (audioStream) {
          // Stream will continue in meeting room
        }
        navigate({
          to: '/$meetingId/meeting',
          params: { meetingId },
        });
      }
    } catch (error: any) {
      // Surface friendly errors based on backend messages
      const message: string =
        error?.response?.data?.message ??
        error?.message ??
        'Failed to join meeting';

      if (message.toLowerCase().includes('not started')) {
        toast.error(
          'This meeting has not started yet. Please wait for the host.'
        );
      } else if (message.toLowerCase().includes('ended')) {
        toast.error('This meeting has already ended.');
      } else if (message.toLowerCase().includes('not invited')) {
        toast.error('You are not invited to this meeting.');
      } else {
        toast.error(message);
      }
    }
  };

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
              {cameraStream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500">
                  <Camera className="h-8 w-8" />
                  <p className="text-sm">
                    {permissions.camera
                      ? 'Camera permission granted. Initialising preview…'
                      : 'Camera permission needed'}
                  </p>
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <PermissionTile
                granted={permissions.microphone}
                title="Microphone"
                description="Allow mic to enable your voice in the session."
                onRequest={requestMicrophone}
              />
              <PermissionTile
                granted={permissions.camera}
                title="Camera"
                description="Share your video to feel present in the room."
                onRequest={requestCamera}
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
              <Toggle
                pressed={spatialAudio}
                onPressedChange={setSpatialAudio}
                className="data-[state=on]:bg-sky-500 data-[state=on]:text-slate-950"
              >
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
              onClick={() => setJoinWithMicrophone((prev) => !prev)}
            >
              {joinWithMicrophone ? 'Mute mic on join' : 'Join muted'}
            </Button>
            <Button
              variant={joinWithCamera ? 'outline' : 'ghost'}
              size="sm"
              onClick={() => setJoinWithCamera((prev) => !prev)}
            >
              {joinWithCamera ? 'Turn camera off' : 'Join with camera off'}
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap justify-center gap-3">
          <Button
            variant="ghost"
            onClick={testDevices}
            className="border border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900 dark:border-slate-800/60 dark:text-slate-200 dark:hover:border-slate-700"
          >
            Test devices
          </Button>
          <Button
            disabled={!meetingId || joinMeeting.isPending}
            className="flex items-center gap-2 bg-sky-500 px-6 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-800/60 disabled:text-slate-500"
            onClick={handleJoinMeeting}
          >
            {joinMeeting.isPending ? (
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
    </div>
  );
}

function PermissionTile({
  granted,
  title,
  description,
  onRequest,
}: {
  granted: boolean;
  title: string;
  description: string;
  onRequest: () => void;
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
        onClick={onRequest}
        className="mt-3 inline-flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
      >
        {granted ? 'Re-check' : 'Allow access'}
      </Button>
    </div>
  );
}
