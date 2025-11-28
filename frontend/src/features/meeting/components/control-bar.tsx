import * as React from 'react';
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
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type ControlBarProps = {
  meetingName: string;
  media: { audio: boolean; video: boolean };
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onEndMeeting?: () => void;
};

const RADIAL_SETTINGS_ITEMS = [
  { id: 'tone', label: 'Tone', icon: Smile },
  { id: 'energy', label: 'Energy', icon: Flame },
] as const;

export function ControlBar({
  meetingName,
  media,
  onToggleAudio,
  onToggleVideo,
  onEndMeeting,
}: ControlBarProps) {
  const [showVolume, setShowVolume] = React.useState(false);
  const [volume, setVolume] = React.useState(70);
  const volumePopoverRef = React.useRef<HTMLDivElement | null>(null);
  const volumeButtonRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!showVolume) return;
      const target = event.target as Node;
      if (
        volumePopoverRef.current &&
        !volumePopoverRef.current.contains(target) &&
        volumeButtonRef.current &&
        !volumeButtonRef.current.contains(target)
      ) {
        setShowVolume(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowVolume(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [showVolume]);

  const controls = [
    {
      id: 'mic' as const,
      label: media.audio ? 'Mute' : 'Unmute',
      icon: media.audio ? Mic : MicOff,
      onClick: onToggleAudio,
    },
    {
      id: 'speaker' as const,
      label: 'Adjust volume',
      icon: Volume2,
      onClick: () => setShowVolume((prev) => !prev),
    },
    {
      id: 'camera' as const,
      label: media.video ? 'Turn camera off' : 'Turn camera on',
      icon: media.video ? Monitor : VideoOff,
      onClick: onToggleVideo,
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

      <div className="relative flex flex-wrap items-center justify-center gap-3">
        {controls.map((control) =>
          control.id === 'settings' ? (
            <SettingsRadialMenu key={control.id} />
          ) : (
            <Tooltip key={control.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  ref={control.id === 'speaker' ? volumeButtonRef : undefined}
                  onClick={control.onClick}
                  className={`h-11 w-11 rounded-full border border-slate-200/70 bg-slate-100 text-slate-700 transition hover:border-slate-300 hover:bg-slate-200 dark:border-slate-900/60 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800/80 ${
                    control.id === 'mic' && !media.audio
                      ? 'opacity-60'
                      : control.id === 'camera' && !media.video
                        ? 'opacity-60'
                        : ''
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

        {showVolume ? (
          <div
            ref={volumePopoverRef}
            className="absolute bottom-16 left-1/2 z-30 w-40 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Volume</span>
              <span>{volume}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              className="mt-3 w-full accent-slate-700"
            />
          </div>
        ) : null}

        <Button
          onClick={onEndMeeting}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-red-500 px-5 text-sm font-semibold text-slate-50 hover:bg-red-400"
        >
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
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);

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
