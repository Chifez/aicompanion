import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  Flame,
  Mic,
  MicOff,
  Monitor,
  PhoneOff,
  Settings,
  Signal,
  Smile,
  VideoOff,
  Volume2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  MeetingLayoutEngine,
  type MeetingLayoutConfig,
  type ScreenSize,
} from '@/components/utils/layout-engine.ts';

type Participant = {
  id: string;
  name: string;
  label: string;
  avatar: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
};

const RADIAL_SETTINGS_ITEMS = [
  { id: 'tone', label: 'Tone', icon: Smile },
  { id: 'energy', label: 'Energy', icon: Flame },
] as const;

const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'alex',
    name: 'Alex Rivera',
    label: 'You',
    avatar: 'https://avatar.vercel.sh/you',
    audioEnabled: true,
    videoEnabled: true,
  },
  // {
  //   id: 'jordan',
  //   name: 'Jordan Chen',
  //   label: 'Product Lead',
  //   avatar: 'https://avatar.vercel.sh/jordan',
  //   audioEnabled: false,
  //   videoEnabled: true,
  // },
];

const getParticipantStatus = (participant: Participant) =>
  `${participant.videoEnabled ? 'Camera on' : 'Camera off'} · ${
    participant.audioEnabled ? 'Mic active' : 'Mic muted'
  }`;

export const Route = createFileRoute('/$meetingId/meeting')({
  component: MeetingRoom,
});

function MeetingRoom() {
  const { meetingId } = Route.useParams();
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
      '“Ready when you are. What would you like to focus on first today?”',
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

function ControlBar({
  meetingName,
  media,
  onToggleAudio,
  onToggleVideo,
}: {
  meetingName: string;
  media: { audio: boolean; video: boolean };
  onToggleAudio: () => void;
  onToggleVideo: () => void;
}) {
  const controls = [
    {
      id: 'mic' as const,
      label: media.audio ? 'Mute' : 'Unmute',
      icon: Mic,
      onClick: onToggleAudio,
      active: media.audio,
    },
    {
      id: 'speaker' as const,
      label: 'Audio',
      icon: Volume2,
    },
    {
      id: 'camera' as const,
      label: media.video ? 'Turn camera off' : 'Turn camera on',
      icon: Monitor,
      onClick: onToggleVideo,
      active: media.video,
    },
    {
      id: 'settings' as const,
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <section className="sticky bottom-0 z-20 flex gap-3 border-t border-slate-200/70 bg-white/90 px-4 py-4 text-slate-700 backdrop-blur flex-row items-center justify-between sm:px-6 sm:py-5 dark:border-slate-900/60 dark:bg-slate-950/90 dark:text-slate-300">
      <div className="flex items-center gap-2 text-sm">
        <span className="hidden text-xs uppercase tracking-[0.25em] text-slate-500 sm:inline">
          Meeting ID
        </span>
        <span className="text-base font-semibold text-slate-900 dark:text-slate-50">
          {meetingName}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {controls.map((control) =>
          control.id === 'settings' ? (
            <SettingsRadialMenu key={control.id} />
          ) : (
            <Tooltip key={control.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={control.onClick}
                  className={`h-11 w-11 rounded-full border border-slate-200/70 bg-slate-100 text-slate-700 transition hover:border-slate-300 hover:bg-slate-200 dark:border-slate-900/60 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800/80 ${
                    control.active === false ? 'opacity-50 dark:opacity-60' : ''
                  }`}
                >
                  <control.icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="border-slate-200/70 bg-white text-slate-700 dark:border-slate-900/60 dark:bg-slate-950 dark:text-slate-200">
                {control.label}
              </TooltipContent>
            </Tooltip>
          )
        )}
        <Button className="inline-flex h-11 items-center gap-2 rounded-full bg-red-500 px-5 text-sm font-semibold text-slate-50 hover:bg-red-400">
          <PhoneOff className="h-4 w-4" />
          <span className="hidden sm:inline">Leave</span>
        </Button>
      </div>

      <div className="hidden items-center gap-2 rounded-full border border-slate-200/70 bg-slate-100 px-3 py-2 text-xs sm:flex dark:border-slate-900/60 dark:bg-slate-900/40">
        <Signal className="h-4 w-4 text-emerald-500 dark:text-emerald-300" />
        <span className="hidden sm:inline">Connection optimal</span>
        <span aria-hidden className="hidden md:inline">
          •
        </span>
        <span className="hidden md:inline">220ms</span>
        <span aria-hidden className="hidden lg:inline">
          •
        </span>
        <span className="hidden lg:inline">48kHz</span>
      </div>
    </section>
  );
}

function SettingsRadialMenu() {
  const [open, setOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!open) return;
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const radius = 72;

  return (
    <div ref={wrapperRef} className="relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-expanded={open}
            aria-haspopup="true"
            onClick={() => setOpen((previous) => !previous)}
            className="h-11 w-11 rounded-full border border-slate-200/70 bg-slate-100 text-slate-700 hover:border-slate-300 hover:bg-slate-200 dark:border-slate-900/60 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800/80"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="border-slate-200/70 bg-white text-slate-700 dark:border-slate-900/60 dark:bg-slate-950 dark:text-slate-200">
          Settings
        </TooltipContent>
      </Tooltip>

      <div
        className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-all duration-200 ease-out ${
          open ? 'opacity-100 delay-75' : 'scale-75 opacity-0'
        }`}
      >
        {RADIAL_SETTINGS_ITEMS.map((item, index) => {
          const angle = (-90 - index * 45) * (Math.PI / 180);
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="pointer-events-auto absolute h-10 w-10 rounded-full border border-slate-200/80 bg-white/90 text-slate-700 shadow-sm backdrop-blur hover:border-slate-300 hover:bg-slate-200 dark:border-slate-900/60 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                >
                  <item.icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="border-slate-200/70 bg-white text-slate-700 dark:border-slate-900/60 dark:bg-slate-950 dark:text-slate-200">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

function ParticipantVideoTile({
  participant,
  compact,
}: {
  participant: Participant;
  compact?: boolean;
}) {
  const statusText = getParticipantStatus(participant);
  const poster =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%230f172a' offset='0'/%3E%3Cstop stop-color='%231d4ed8' offset='1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='640' height='360' fill='url(%23g)'/%3E%3C/svg%3E";
  const overlayClasses = compact
    ? 'bottom-2 left-2 px-2 py-1 text-[11px]'
    : 'bottom-3 left-3 px-3 py-2 text-xs';

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[inherit] border border-slate-200/70 bg-slate-100/40 dark:border-slate-800/60 dark:bg-slate-900/40">
      <video
        className={`h-full w-full rounded-[inherit] object-cover transition duration-300 ${
          participant.videoEnabled ? 'opacity-100' : 'opacity-25 grayscale'
        }`}
        autoPlay
        muted
        loop
        playsInline
        poster={poster}
      >
        <source
          src="https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4"
          type="video/mp4"
        />
      </video>

      <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-linear-to-t from-slate-950/70 via-transparent to-transparent" />

      {!participant.videoEnabled ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-slate-100">
          <VideoOff className="h-10 w-10" />
        </div>
      ) : null}

      {!participant.audioEnabled ? (
        <div className="pointer-events-none absolute top-3 right-3 rounded-full bg-black/60 p-1.5">
          <MicOff className="h-4 w-4 text-rose-300" />
        </div>
      ) : null}

      <div
        className={`max-w-full pointer-events-none absolute flex flex-col rounded-lg bg-black/60 text-slate-100 ${overlayClasses}`}
      >
        <span className="text-sm font-semibold line-clamp-1">
          {participant.name}
        </span>
      </div>
    </div>
  );
}

function useScreenSize(): ScreenSize {
  const [size, setSize] = React.useState<ScreenSize>(() =>
    typeof window === 'undefined' ? 'desktop' : getScreenSize(window.innerWidth)
  );

  React.useEffect(() => {
    const handleResize = () => {
      setSize(getScreenSize(window.innerWidth));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

function getScreenSize(width: number): ScreenSize {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}
