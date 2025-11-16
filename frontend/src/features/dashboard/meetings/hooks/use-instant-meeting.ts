import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMeetingMutations } from './use-meeting-mutations';

export function useInstantMeeting() {
  const navigate = useNavigate();
  const { createMeeting } = useMeetingMutations();
  const [isCreating, setIsCreating] = React.useState(false);

  const startInstantMeeting = React.useCallback(async () => {
    setIsCreating(true);
    // Create a quick meeting with default settings
    const draft = {
      title: 'Quick Session',
      description: 'Instant AI companion session',
      startTime: new Date().toISOString(),
      durationMinutes: 30,
      voiceProfile: '', // Will use default from settings
      isInstant: true, // Mark as instant meeting
    };

    createMeeting.mutate(draft, {
      onSuccess: (meeting) => {
        setIsCreating(false);
        // Navigate to lobby with the new meeting ID
        if (meeting?.summary?.id) {
          navigate({
            to: '/lobby',
            search: { meetingId: meeting.summary.id },
          });
        } else {
          // Fallback: navigate without meetingId if creation failed
          navigate({ to: '/lobby', search: { meetingId: null } });
        }
      },
      onError: () => {
        setIsCreating(false);
        // Fallback: navigate to lobby even if creation fails
        navigate({ to: '/lobby', search: { meetingId: null } });
      },
    });
  }, [createMeeting, navigate]);

  return {
    startInstantMeeting,
    isCreating,
  };
}
