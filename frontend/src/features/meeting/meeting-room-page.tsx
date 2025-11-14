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
import type { Participant } from './types';

const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'alex',
    name: 'Alex Rivera',
    label: 'You',
    avatar: 'https://avatar.vercel.sh/you',
    audioEnabled: true,
    videoEnabled: true,
  },
];

type MeetingRoomPageProps = {
  meetingId: string;
};

export function MeetingRoomPage({ meetingId }: MeetingRoomPageProps) {
  const screenSize = useScreenSize();

  const [participants, setParticipants] =
    React.useState<Participant[]>(INITIAL_PARTICIPANTS);

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
  const selfParticipant = participants.find((p) => p.id === 'alex');

  const formattedMeetingName = React.useMemo(
    () =>
      meetingId
        .split('-')
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' '),
    [meetingId]
  );

  const aiPresence = {
    name: 'Aurora',
    mood: 'Supportive',
    voice: 'Evelyn · Warm Alto',
    prompt:
      '"Ready when you are. What would you like to focus on first today?"',
  };

  const handleToggleAudio = React.useCallback(() => {
    setParticipants((prev) =>
      prev.map((participant) =>
        participant.id === 'alex'
          ? { ...participant, audioEnabled: !participant.audioEnabled }
          : participant
      )
    );
  }, []);

  const handleToggleVideo = React.useCallback(() => {
    setParticipants((prev) =>
      prev.map((participant) =>
        participant.id === 'alex'
          ? { ...participant, videoEnabled: !participant.videoEnabled }
          : participant
      )
    );
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
