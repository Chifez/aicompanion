import { useSearch } from '@tanstack/react-router';
import { useLobby } from './hooks/use-lobby';
import { useVideoPreview } from '@/hooks/use-video-preview';
import { LobbyHeader } from './components/lobby-header';
import { DevicePreviewCard } from './components/device-preview-card';
import { ConnectionChecklistCard } from './components/connection-checklist-card';
import { JoinControls } from './components/join-controls';

export function LobbyPage() {
  const { meetingId } = useSearch({ from: '/lobby' });
  const {
    spatialAudio,
    setSpatialAudio,
    joinWithMicrophone,
    setJoinWithMicrophone,
    joinWithCamera,
    setJoinWithCamera,
    permissions,
    cameraStream,
    requestMicrophone,
    requestCamera,
    testDevices,
    connectionStatus,
    handleJoinMeeting,
    isJoining,
    canJoin,
  } = useLobby({ meetingId });

  const videoRef = useVideoPreview(cameraStream);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col gap-10 px-6 py-12 text-slate-900 dark:text-slate-100">
      <LobbyHeader />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <DevicePreviewCard
          cameraStream={cameraStream}
          videoRef={videoRef}
          permissions={permissions}
          spatialAudio={spatialAudio}
          onSpatialAudioChange={setSpatialAudio}
          onRequestMicrophone={requestMicrophone}
          onRequestCamera={requestCamera}
        />

        <ConnectionChecklistCard connectionStatus={connectionStatus} />
      </div>

      <JoinControls
        joinWithMicrophone={joinWithMicrophone}
        joinWithCamera={joinWithCamera}
        onMicrophoneToggle={() => setJoinWithMicrophone((prev) => !prev)}
        onCameraToggle={() => setJoinWithCamera((prev) => !prev)}
        onTestDevices={testDevices}
        onJoinMeeting={handleJoinMeeting}
        isJoining={isJoining}
        canJoin={canJoin}
      />
    </div>
  );
}
