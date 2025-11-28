import * as React from 'react';
import { MicOff, VideoOff } from 'lucide-react';
import { Track, Room, LocalVideoTrack } from 'livekit-client';
import { getParticipantStatus, type Participant } from '../types';

const PLACEHOLDER_POSTER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0_0_640_360'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%230f172a' offset='0'/%3E%3Cstop stop-color='%231d4ed8' offset='1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='640' height='360' fill='url(%23g)'/%3E%3C/svg%3E";

type ParticipantVideoTileProps = {
  participant: Participant;
  compact?: boolean;
  room?: Room | null; // For local participant video track
};

export function ParticipantVideoTile({
  participant,
  compact,
  room,
}: ParticipantVideoTileProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const statusText = getParticipantStatus(participant);
  const overlayClasses = compact
    ? 'bottom-2 left-2 px-2 py-1 text-[11px]'
    : 'bottom-3 left-3 px-3 py-2 text-xs';

  // Attach LiveKit video track if available
  React.useEffect(() => {
    if (!videoRef.current) return;

    // Handle local participant (from room)
    if (room && participant.label === 'You' && room.localParticipant) {
      // Get the first enabled video track publication
      const videoPublication = Array.from(
        room.localParticipant.videoTrackPublications.values()
      ).find((pub) => pub.track && pub.kind === 'video' && !pub.isMuted);

      if (videoPublication?.track) {
        const localVideoTrack = videoPublication.track as LocalVideoTrack;
        localVideoTrack.attach(videoRef.current);
        return () => {
          localVideoTrack.detach();
        };
      }
      return;
    }

    // Handle remote participant
    if (participant.track) {
      const remoteParticipant = participant.track;
      const videoTrack = Array.from(
        remoteParticipant.videoTrackPublications.values()
      )
        .map((pub) => pub.track)
        .filter(
          (track): track is Track =>
            track !== undefined && track.kind === 'video'
        )
        .find((track) => track.isSubscribed);

      if (videoTrack) {
        videoTrack.attach(videoRef.current);
        return () => {
          videoTrack.detach();
        };
      }
    }
  }, [participant.track, participant.videoEnabled, participant.label, room]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[inherit] border border-slate-200/70 bg-slate-100/40 dark:border-slate-800/60 dark:bg-slate-900/40">
      <video
        ref={videoRef}
        className={`h-full w-full rounded-[inherit] object-cover transition duration-300 ${
          participant.videoEnabled ? 'opacity-100' : 'opacity-25 grayscale'
        }`}
        autoPlay
        playsInline
        poster={PLACEHOLDER_POSTER}
      />

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
        className={`pointer-events-none absolute flex flex-col rounded-lg bg-black/60 text-slate-100 ${overlayClasses}`}
      >
        <span className="text-sm font-semibold">{participant.name}</span>
        <span className="text-[11px] text-slate-200/80">{statusText}</span>
      </div>
    </div>
  );
}
