import * as React from 'react';
import { toast } from 'sonner';

type MediaPermissions = {
  microphone: boolean;
  camera: boolean;
};

type UseMediaStreamsReturn = {
  permissions: MediaPermissions;
  cameraStream: MediaStream | null;
  audioStream: MediaStream | null;
  checkPermissions: () => Promise<void>;
  requestMicrophone: () => Promise<void>;
  requestCamera: () => Promise<void>;
  testDevices: () => Promise<void>;
  cleanup: () => void;
};

export function useMediaStreams(): UseMediaStreamsReturn {
  const [permissions, setPermissions] = React.useState<MediaPermissions>({
    microphone: false,
    camera: false,
  });
  const [cameraStream, setCameraStream] = React.useState<MediaStream | null>(
    null
  );
  const [audioStream, setAudioStream] = React.useState<MediaStream | null>(
    null
  );

  const cleanup = React.useCallback(() => {
    cameraStream?.getTracks().forEach((track) => track.stop());
    audioStream?.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
    setAudioStream(null);
  }, [cameraStream, audioStream]);

  // Cleanup on unmount
  React.useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const checkPermissions = React.useCallback(async () => {
    try {
      // Check microphone permission
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setPermissions((prev) => ({ ...prev, microphone: true }));
      setAudioStream(micStream);

      // Check camera permission
      const camStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });
      setPermissions((prev) => ({ ...prev, camera: true }));
      setCameraStream(camStream);
    } catch (error) {
      console.error('Permission check failed:', error);
    }
  }, []);

  const requestMicrophone = React.useCallback(async () => {
    try {
      // Stop existing stream if any
      audioStream?.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissions((prev) => ({ ...prev, microphone: true }));
      setAudioStream(stream);
    } catch (error) {
      console.error('Microphone permission denied:', error);
    }
  }, [audioStream]);

  const requestCamera = React.useCallback(async () => {
    try {
      // Stop existing stream if any
      cameraStream?.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });
      setPermissions((prev) => ({ ...prev, camera: true }));
      setCameraStream(stream);
    } catch (error) {
      console.error('Camera permission denied:', error);
    }
  }, [cameraStream]);

  const testDevices = React.useCallback(async () => {
    try {
      // Request both audio and video for testing
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: 1280, height: 720 },
      });

      // Split the stream
      const audioTracks = stream.getAudioTracks();
      const videoTracks = stream.getVideoTracks();

      if (audioTracks.length > 0) {
        const audioOnlyStream = new MediaStream(audioTracks);
        setAudioStream(audioOnlyStream);
        setPermissions((prev) => ({ ...prev, microphone: true }));
      }

      if (videoTracks.length > 0) {
        const videoOnlyStream = new MediaStream(videoTracks);
        setCameraStream(videoOnlyStream);
        setPermissions((prev) => ({ ...prev, camera: true }));
      }

      // Test audio by playing a tone
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 440;
      gainNode.gain.value = 0.1;
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
      toast.success('Devices tested successfully');
    } catch (error) {
      console.error('Test devices failed:', error);
      toast.error('Failed to access devices. Please check your permissions.');
    }
  }, []);

  return {
    permissions,
    cameraStream,
    audioStream,
    checkPermissions,
    requestMicrophone,
    requestCamera,
    testDevices,
    cleanup,
  };
}
