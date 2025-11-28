import * as React from 'react';
import {
  Room,
  RoomEvent,
  Track,
  RemoteParticipant,
  LocalParticipant,
} from 'livekit-client';
import { useAuthStore } from '@/stores/auth-store';
import type { Participant } from '../types';

type UseLiveKitRoomOptions = {
  meetingId: string;
  livekitUrl: string;
  livekitToken: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
};

type UseLiveKitRoomReturn = {
  room: Room | null;
  participants: Participant[];
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  toggleAudio: () => Promise<void>;
  toggleVideo: () => Promise<void>;
};

export function useLiveKitRoom({
  meetingId,
  livekitUrl,
  livekitToken,
  audioEnabled: initialAudioEnabled,
  videoEnabled: initialVideoEnabled,
}: UseLiveKitRoomOptions): UseLiveKitRoomReturn {
  const [room, setRoom] = React.useState<Room | null>(null);
  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const [isConnected, setIsConnected] = React.useState(false);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [audioEnabled, setAudioEnabled] = React.useState(initialAudioEnabled);
  const [videoEnabled, setVideoEnabled] = React.useState(initialVideoEnabled);

  const user = useAuthStore((state) => state.session?.user);

  // Convert LiveKit participant to our Participant type
  const participantToParticipant = React.useCallback(
    (participant: RemoteParticipant | LocalParticipant): Participant => {
      const metadata = participant.metadata
        ? JSON.parse(participant.metadata)
        : {};
      return {
        id: participant.identity,
        name: metadata.name || participant.name || 'Unknown',
        label:
          participant instanceof LocalParticipant
            ? 'You'
            : participant.name || 'Participant',
        avatar:
          metadata.avatarUrl ||
          `https://avatar.vercel.sh/${participant.identity}`,
        audioEnabled: participant.isMicrophoneEnabled,
        videoEnabled: participant.isCameraEnabled,
        track:
          participant instanceof LocalParticipant
            ? undefined
            : (participant as RemoteParticipant),
      };
    },
    []
  );

  // Update participants list
  const updateParticipants = React.useCallback(
    (currentRoom: Room) => {
      const allParticipants: Participant[] = [];

      // Add local participant
      if (currentRoom.localParticipant) {
        allParticipants.push(
          participantToParticipant(currentRoom.localParticipant)
        );
      }

      // Add remote participants
      currentRoom.remoteParticipants.forEach((participant) => {
        allParticipants.push(participantToParticipant(participant));
      });

      setParticipants(allParticipants);
    },
    [participantToParticipant]
  );

  const setupEventListeners = React.useCallback(
    (currentRoom: Room) => {
      // Participant connected
      currentRoom.on(RoomEvent.ParticipantConnected, (participant) => {
        console.log('Participant connected:', participant.identity);
        updateParticipants(currentRoom);
      });

      // Participant disconnected
      currentRoom.on(RoomEvent.ParticipantDisconnected, (participant) => {
        console.log('Participant disconnected:', participant.identity);
        updateParticipants(currentRoom);
      });

      // Track subscribed
      currentRoom.on(
        RoomEvent.TrackSubscribed,
        (track, publication, participant) => {
          console.log('Track subscribed:', track.kind, participant.identity);
          updateParticipants(currentRoom);
        }
      );

      // Track unsubscribed
      currentRoom.on(RoomEvent.TrackUnsubscribed, (track, participant) => {
        console.log('Track unsubscribed:', track.kind, participant.identity);
        updateParticipants(currentRoom);
      });

      // Track muted/unmuted
      currentRoom.on(RoomEvent.TrackMuted, (publication, participant) => {
        console.log('Track muted:', publication.kind, participant.identity);
        updateParticipants(currentRoom);
      });

      currentRoom.on(RoomEvent.TrackUnmuted, (publication, participant) => {
        console.log('Track unmuted:', publication.kind, participant.identity);
        updateParticipants(currentRoom);
      });

      // Participant metadata changed
      currentRoom.on(
        RoomEvent.ParticipantMetadataChanged,
        (metadata, participant) => {
          console.log('Participant metadata changed:', participant.identity);
          updateParticipants(currentRoom);
        }
      );

      // Connection state changes
      currentRoom.on(RoomEvent.Disconnected, () => {
        console.log('Disconnected from room');
        setIsConnected(false);
        setRoom(null);
        setParticipants([]);
      });

      currentRoom.on(RoomEvent.Reconnecting, () => {
        console.log('Reconnecting to room...');
      });

      currentRoom.on(RoomEvent.Reconnected, () => {
        console.log('Reconnected to room');
        setIsConnected(true);
        updateParticipants(currentRoom);
      });
    },
    [updateParticipants]
  );

  // Connect to LiveKit room
  const connect = React.useCallback(async () => {
    if (isConnecting || isConnected || !livekitUrl || !livekitToken) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        // Enable simulcast for better quality
      });

      // Set up event listeners before connecting
      setupEventListeners(newRoom);

      // Connect to room
      await newRoom.connect(livekitUrl, livekitToken);

      // Enable tracks based on initial state
      if (audioEnabled) {
        await newRoom.localParticipant.setMicrophoneEnabled(true);
      }
      if (videoEnabled) {
        await newRoom.localParticipant.setCameraEnabled(true);
      }

      setRoom(newRoom);
      setIsConnected(true);
      updateParticipants(newRoom);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to connect to room');
      setError(error);
      console.error('LiveKit connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [
    isConnecting,
    isConnected,
    livekitUrl,
    livekitToken,
    audioEnabled,
    videoEnabled,
    user,
    updateParticipants,
    setupEventListeners,
  ]);

  // Set up event listeners

  // Disconnect from room
  const disconnect = React.useCallback(async () => {
    if (room) {
      room.disconnect();
      setRoom(null);
      setIsConnected(false);
      setParticipants([]);
    }
  }, [room]);

  // Toggle audio
  const toggleAudio = React.useCallback(async () => {
    if (!room) return;

    const newState = !audioEnabled;
    setAudioEnabled(newState);
    await room.localParticipant.setMicrophoneEnabled(newState);
    updateParticipants(room);
  }, [room, audioEnabled, updateParticipants]);

  // Toggle video
  const toggleVideo = React.useCallback(async () => {
    if (!room) return;

    const newState = !videoEnabled;
    setVideoEnabled(newState);
    await room.localParticipant.setCameraEnabled(newState);
    updateParticipants(room);
  }, [room, videoEnabled, updateParticipants]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  return {
    room,
    participants,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    toggleAudio,
    toggleVideo,
  };
}
