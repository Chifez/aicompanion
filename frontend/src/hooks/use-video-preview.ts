import * as React from 'react';

export function useVideoPreview(stream: MediaStream | null) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const video = videoRef.current;
    if (video && stream) {
      video.srcObject = stream;
      // Some browsers require an explicit play() call after setting srcObject
      void video.play().catch(() => {
        // Ignore autoplay errors – user interaction in lobby (e.g. clicking) will allow play
      });
    } else if (video && !stream) {
      video.srcObject = null;
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  return videoRef;
}
