import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import {
  MeetingLayoutEngine,
  type MeetingLayoutConfig,
} from './utils/layout-engine';
import { ControlBar } from './components/control-bar';
import { ParticipantVideoTile } from './components/participant-video-tile';
import { useScreenSize } from './hooks/use-screen-size';
import { useMeetingDetail } from '@/features/dashboard/meetings/hooks/use-meeting-detail';
import { useAuthStore } from '@/stores/auth-store';
import { useLiveKitRoom } from './hooks/use-livekit-room';
import type { Participant } from './types';
import type { MeetingJoinResponse } from '@/types/api';
import { useNavigate } from '@tanstack/react-router';

type MeetingRoomPageProps = {
  meetingId: string;
};

export function MeetingRoomPage({ meetingId }: MeetingRoomPageProps) {
  const navigate = useNavigate();
  const screenSize = useScreenSize();
  const user = useAuthStore((state) => state.session?.user);
  const meetingDetailQuery = useMeetingDetail(meetingId);

  // Get LiveKit credentials from localStorage (set by lobby)
  const [livekitCredentials, setLivekitCredentials] = React.useState<{
    url: string;
    token: string;
    audioEnabled: boolean;
    videoEnabled: boolean;
  } | null>(null);

  const [tokenError, setTokenError] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      // Use sessionStorage for better security (cleared when tab closes)
      const tokensRaw = sessionStorage.getItem('meetingTokens');
      const prefsRaw = sessionStorage.getItem('meetingJoinPrefs');

      if (!tokensRaw) {
        const errorMsg =
          'No meeting credentials found. Please join from the lobby.';
        console.error(errorMsg);
        setTokenError(errorMsg);
        return;
      }

      const tokens = JSON.parse(tokensRaw) as MeetingJoinResponse;
      const prefs = prefsRaw
        ? (JSON.parse(prefsRaw) as {
            audioEnabled?: boolean;
            videoEnabled?: boolean;
          })
        : { audioEnabled: true, videoEnabled: true };

      if (tokens.livekitUrl && tokens.livekitToken) {
        setLivekitCredentials({
          url: tokens.livekitUrl,
          token: tokens.livekitToken,
          audioEnabled: prefs.audioEnabled ?? true,
          videoEnabled: prefs.videoEnabled ?? true,
        });
        setTokenError(null); // Clear any previous errors
      } else {
        const errorMsg =
          'LiveKit credentials missing from join response. Please try joining again.';
        console.error(errorMsg);
        setTokenError(errorMsg);
      }
    } catch (error) {
      const errorMsg =
        'Failed to load meeting credentials. Please try joining again.';
      console.error(errorMsg, error);
      setTokenError(errorMsg);
    }
  }, []);

  // Use LiveKit room hook
  const {
    room,
    participants: livekitParticipants,
    isConnected,
    isConnecting,
    error: livekitError,
    connect,
    disconnect,
    toggleAudio,
    toggleVideo,
  } = useLiveKitRoom({
    meetingId,
    livekitUrl: livekitCredentials?.url || '',
    livekitToken: livekitCredentials?.token || '',
    audioEnabled: livekitCredentials?.audioEnabled ?? true,
    videoEnabled: livekitCredentials?.videoEnabled ?? true,
  });

  // Connect to LiveKit when credentials are available
  React.useEffect(() => {
    if (livekitCredentials && !isConnected && !isConnecting) {
      connect();
    }
  }, [livekitCredentials, isConnected, isConnecting, connect]);

  // Handle end meeting - disconnect and navigate away
  const handleEndMeeting = React.useCallback(async () => {
    // Disconnect from LiveKit
    await disconnect();
    // Clear tokens
    sessionStorage.removeItem('meetingTokens');
    sessionStorage.removeItem('meetingJoinPrefs');
    // Navigate back to dashboard
    navigate({ to: '/dashboard' });
  }, [disconnect, navigate]);

  // Cleanup on unmount - only disconnect, don't clear tokens
  // (tokens are cleared when explicitly ending meeting)
  React.useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Combine LiveKit participants with AI participant
  const participants = React.useMemo(() => {
    const allParticipants = [...livekitParticipants];

    // Add AI participant if meeting has voice profile
    if (meetingDetailQuery.data?.summary.voiceProfile) {
      const voiceProfile = meetingDetailQuery.data.summary.voiceProfile;
      const aiName = voiceProfile.split(' · ')[0] || 'AI Companion';

      // Only add if not already present
      if (!allParticipants.find((p) => p.id === 'ai')) {
        allParticipants.push({
          id: 'ai',
          name: aiName,
          label: 'AI',
          avatar: 'https://avatar.vercel.sh/ai',
          audioEnabled: true,
          videoEnabled: false,
        });
      }
    }

    return allParticipants;
  }, [livekitParticipants, meetingDetailQuery.data]);

  const activeParticipants = React.useMemo(
    () => participants.slice(0, 2),
    [participants]
  );

  const layout = React.useMemo<MeetingLayoutConfig>(
    () =>
      MeetingLayoutEngine.compute({
        participantCount: activeParticipants.length,
        screenSize,
      }),
    [activeParticipants.length, screenSize]
  );

  const secondaryParticipants =
    layout.variant === 'double' ? activeParticipants : [];
  const floatingParticipant =
    layout.variant === 'single' ? activeParticipants[0] : undefined;
  const selfParticipant = participants.find((p) => p.id === user?.id);

  const formattedMeetingName = React.useMemo(
    () => meetingDetailQuery.data?.summary.title || meetingId,
    [meetingDetailQuery.data, meetingId]
  );

  const aiPresence = React.useMemo(() => {
    const voiceProfile = meetingDetailQuery.data?.summary.voiceProfile || '';
    const parts = voiceProfile.split(' · ');
    return {
      name: parts[0] || 'Aurora',
      mood: parts[1] || 'Supportive',
      voice: voiceProfile || 'Evelyn · Warm Alto',
      prompt:
        '"Ready when you are. What would you like to focus on first today?"',
    };
  }, [meetingDetailQuery.data]);

  const handleToggleAudio = React.useCallback(async () => {
    await toggleAudio();
  }, [toggleAudio]);

  const handleToggleVideo = React.useCallback(async () => {
    await toggleVideo();
  }, [toggleVideo]);

  return (
    <div className="relative flex h-screen flex-col bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <main className="relative flex flex-1 flex-col px-4 py-6 sm:px-6 lg:px-10">
        <div className={layout.containerClass}>
          <div className={layout.mainTileWrapperClass}>
            <Card className={layout.mainTileClass}>
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
          </div>

          {layout.secondaryContainerClass ? (
            <div className={layout.secondaryContainerClass}>
              {secondaryParticipants.map((participant) => (
                <div key={participant.id} className={layout.secondaryTileClass}>
                  <ParticipantVideoTile participant={participant} room={room} />
                </div>
              ))}
            </div>
          ) : null}

          {layout.floatingSelfWrapperClass && floatingParticipant ? (
            <div className={layout.floatingSelfWrapperClass}>
              <div className={layout.floatingSelfTileClass}>
                <ParticipantVideoTile
                  participant={floatingParticipant}
                  compact
                  room={room}
                />
              </div>
            </div>
          ) : null}

          {/* Connection status and errors */}
          {isConnecting && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-lg bg-blue-500/90 px-4 py-2 text-sm text-white">
              Connecting to meeting...
            </div>
          )}
          {livekitError && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-lg bg-red-500/90 px-4 py-2 text-sm text-white">
              Connection error: {livekitError.message}
            </div>
          )}
          {tokenError && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-lg bg-red-500/90 px-4 py-2 text-sm text-white max-w-md text-center">
              {tokenError}
              <button
                onClick={() => navigate({ to: '/dashboard' })}
                className="ml-2 underline"
              >
                Go to Dashboard
              </button>
            </div>
          )}
          {!isConnected &&
            !isConnecting &&
            livekitCredentials &&
            !tokenError && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-lg bg-yellow-500/90 px-4 py-2 text-sm text-white">
                Not connected. Please refresh the page.
              </div>
            )}
        </div>
      </main>

      <ControlBar
        meetingName={formattedMeetingName}
        media={{
          audio: selfParticipant?.audioEnabled ?? false,
          video: selfParticipant?.videoEnabled ?? false,
        }}
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onEndMeeting={handleEndMeeting}
      />
    </div>
  );
}
