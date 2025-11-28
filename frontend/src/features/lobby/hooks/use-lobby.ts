import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useMeetingDetail } from '@/features/dashboard/meetings/hooks/use-meeting-detail';
import { useMeetingJoin } from '@/features/dashboard/meetings/hooks/use-meeting-join';
import { useMediaStreams } from '@/hooks/use-media-streams';
import { useConnectionStatus } from '@/hooks/use-connection-status';
import { useAuthStore } from '@/stores/auth-store';
import { apiClient } from '@/lib/api-client';

interface UseLobbyProps {
  meetingId: string | null;
}

export function useLobby({ meetingId }: UseLobbyProps) {
  const navigate = useNavigate();
  const userId = useAuthStore((state) => state.session?.user.id ?? null);
  const meetingDetailQuery = useMeetingDetail(meetingId);
  const joinMeeting = useMeetingJoin();

  const [spatialAudio, setSpatialAudio] = useState(false);
  const [joinWithMicrophone, setJoinWithMicrophone] = useState(true);
  const [joinWithCamera, setJoinWithCamera] = useState(true);

  const {
    permissions,
    cameraStream,
    audioStream,
    checkPermissions,
    requestMicrophone,
    requestCamera,
    testDevices,
  } = useMediaStreams();

  const connectionStatus = useConnectionStatus({
    enabled: Boolean(meetingId && meetingDetailQuery.data),
  });

  // Check browser permissions on mount
  useEffect(() => {
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

  return {
    spatialAudio,
    setSpatialAudio,
    joinWithMicrophone,
    setJoinWithMicrophone,
    joinWithCamera,
    setJoinWithCamera,
    permissions,
    cameraStream,
    audioStream,
    requestMicrophone,
    requestCamera,
    testDevices,
    connectionStatus,
    handleJoinMeeting,
    isJoining: joinMeeting.isPending,
    canJoin: Boolean(meetingId),
  };
}
