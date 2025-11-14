export type Participant = {
  id: string;
  name: string;
  label: string;
  avatar: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
};

export const getParticipantStatus = (participant: Participant) =>
  `${participant.videoEnabled ? 'Camera on' : 'Camera off'} · ${
    participant.audioEnabled ? 'Mic active' : 'Mic muted'
  }`;
