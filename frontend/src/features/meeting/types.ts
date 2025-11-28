import type { RemoteParticipant } from 'livekit-client';

export type Participant = {
  id: string;
  name: string;
  label: string;
  avatar: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  track?: RemoteParticipant; // LiveKit remote participant for video tracks
};

export const getParticipantStatus = (participant: Participant) =>
  `${participant.videoEnabled ? 'Camera on' : 'Camera off'} · ${
    participant.audioEnabled ? 'Mic active' : 'Mic muted'
  }`;
