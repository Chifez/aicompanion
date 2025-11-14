import { Download, Lock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SettingToggle } from './setting-toggle';

type PrivacyCardProps = {
  recordingEnabled: boolean;
  allowModelTraining: boolean;
  onTogglePrivacy: (value: boolean) => void;
  onToggleDownloads: (value: boolean) => void;
};

export function PrivacyCard({
  recordingEnabled,
  allowModelTraining,
  onTogglePrivacy,
  onToggleDownloads,
}: PrivacyCardProps) {
  return (
    <Card className="border-slate-200/70 bg-white shadow-sm dark:border-slate-900/60 dark:bg-slate-950/60">
      <CardHeader>
        <CardTitle className="text-base text-slate-900 dark:text-slate-100">
          Privacy & data
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Control how transcripts are stored and anonymised.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
        <SettingToggle
          icon={<Lock className="h-4 w-4" />}
          label="Record sessions"
          description="Allow the workspace to retain session transcripts."
          helper="Workspace encrypted"
          checked={recordingEnabled}
          onChange={onTogglePrivacy}
        />
        <Separator className="border-slate-200/70 dark:border-slate-900/60" />
        <SettingToggle
          icon={<Download className="h-4 w-4" />}
          label="Contribute to training"
          description="Permit anonymised data to improve AI-host recommendations."
          helper="Optional"
          checked={allowModelTraining}
          onChange={onToggleDownloads}
        />
      </CardContent>
    </Card>
  );
}
