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
import type { Participant } from './types';

type MeetingRoomPageProps = {
  meetingId: string;
};

export function MeetingRoomPage({ meetingId }: MeetingRoomPageProps) {
  const screenSize = useScreenSize();
  const user = useAuthStore((state) => state.session?.user);
  const meetingDetailQuery = useMeetingDetail(meetingId);

  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const [audioEnabled, setAudioEnabled] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const raw = window.localStorage.getItem('meetingJoinPrefs');
      if (!raw) return true;
      const parsed = JSON.parse(raw) as { audioEnabled?: boolean };
      return parsed.audioEnabled ?? true;
    } catch {
      return true;
    }
  });
  const [videoEnabled, setVideoEnabled] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const raw = window.localStorage.getItem('meetingJoinPrefs');
      if (!raw) return true;
      const parsed = JSON.parse(raw) as { videoEnabled?: boolean };
      return parsed.videoEnabled ?? true;
    } catch {
      return true;
    }
  });

  // Initialize self participant from user session
  React.useEffect(() => {
    if (user) {
      setParticipants([
        {
          id: user.id,
          name: user.name,
          label: 'You',
          avatar: user.avatarUrl || `https://avatar.vercel.sh/${user.id}`,
          audioEnabled,
          videoEnabled,
        },
      ]);
    }
  }, [user, audioEnabled, videoEnabled]);

  // Load meeting details and AI presence
  React.useEffect(() => {
    if (meetingDetailQuery.data) {
      // Add AI participant if meeting has voice profile
      const voiceProfile = meetingDetailQuery.data.summary.voiceProfile;
      if (voiceProfile) {
        setParticipants((prev) => {
          // Only add if not already present
          if (prev.find((p) => p.id === 'ai')) {
            return prev;
          }
          return [
            ...prev,
            {
              id: 'ai',
              name: voiceProfile.split(' · ')[0] || 'AI Companion',
              label: 'AI',
              avatar: 'https://avatar.vercel.sh/ai',
              audioEnabled: true,
              videoEnabled: false,
            },
          ];
        });
      }
    }
  }, [meetingDetailQuery.data]);

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

  const handleToggleAudio = React.useCallback(() => {
    setAudioEnabled((prev) => !prev);
  }, []);

  const handleToggleVideo = React.useCallback(() => {
    setVideoEnabled((prev) => !prev);
  }, []);

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
                  <ParticipantVideoTile participant={participant} />
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
                />
              </div>
            </div>
          ) : null}
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
      />
    </div>
  );
}
