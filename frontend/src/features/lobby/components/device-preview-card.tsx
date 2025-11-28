import { Camera } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PermissionTile } from './permission-tile';
import { Toggle } from '@/components/ui/toggle';

interface DevicePreviewCardProps {
  cameraStream: MediaStream | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  permissions: {
    microphone: boolean;
    camera: boolean;
  };
  spatialAudio: boolean;
  onSpatialAudioChange: (enabled: boolean) => void;
  onRequestMicrophone: () => void;
  onRequestCamera: () => void;
}

export function DevicePreviewCard({
  cameraStream,
  videoRef,
  permissions,
  spatialAudio,
  onSpatialAudioChange,
  onRequestMicrophone,
  onRequestCamera,
}: DevicePreviewCardProps) {
  return (
    <Card className="border-slate-200/70 bg-white shadow-sm dark:border-slate-900/60 dark:bg-slate-950/60">
      <CardHeader>
        <CardTitle className="text-base text-slate-900 dark:text-slate-100">
          Device preview
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Grant permissions and confirm your environment before joining.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-100 dark:border-slate-900/60 dark:bg-slate-900/50">
          {cameraStream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500">
              <Camera className="h-8 w-8" />
              <p className="text-sm">
                {permissions.camera
                  ? 'Camera permission granted. Initialising preview…'
                  : 'Camera permission needed'}
              </p>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <PermissionTile
            granted={permissions.microphone}
            title="Microphone"
            description="Allow mic to enable your voice in the session."
            onRequest={onRequestMicrophone}
          />
          <PermissionTile
            granted={permissions.camera}
            title="Camera"
            description="Share your video to feel present in the room."
            onRequest={onRequestCamera}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-100 px-4 py-3 dark:border-slate-900/60 dark:bg-slate-900/40">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Spatial audio mode
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Immersive mix for headphones.
            </p>
          </div>
          <Toggle
            pressed={spatialAudio}
            onPressedChange={onSpatialAudioChange}
            className="data-[state=on]:bg-sky-500 data-[state=on]:text-slate-950"
          >
            Enable
          </Toggle>
        </div>
      </CardContent>
    </Card>
  );
}
