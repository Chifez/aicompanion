import * as React from 'react';

type ConnectionStatus = {
  webrtc: boolean;
  openai: boolean;
  elevenlabs: boolean;
  redis: boolean;
};

type UseConnectionStatusOptions = {
  enabled?: boolean;
  delay?: number;
};

export function useConnectionStatus(
  options: UseConnectionStatusOptions = {}
): ConnectionStatus {
  const { enabled = true, delay = 1000 } = options;
  const [status, setStatus] = React.useState<ConnectionStatus>({
    webrtc: false,
    openai: false,
    elevenlabs: false,
    redis: false,
  });

  React.useEffect(() => {
    if (!enabled) return;

    // TODO: Call backend API GET /meetings/{meetingId}/status to check actual connection status
    // For now, simulate connection check after a delay
    const timer = setTimeout(() => {
      setStatus({
        webrtc: true,
        openai: true,
        elevenlabs: true,
        redis: true,
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [enabled, delay]);

  return status;
}
