import clsx from 'clsx';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Personality } from '../types';

type PersonalityCardProps = {
  personalities: Personality[];
  activeId: string;
  onSelectPersonality: (personality: Personality) => void;
  onManagePresets: () => void;
};

export function PersonalityCard({
  personalities,
  activeId,
  onSelectPersonality,
  onManagePresets,
}: PersonalityCardProps) {
  return (
    <Card className="border-slate-200/70 bg-white shadow-sm dark:border-slate-900/60 dark:bg-slate-950/60">
      <CardHeader>
        <CardTitle className="text-base text-slate-900 dark:text-slate-100">
          Personality & voice
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Choose how your AI companion greets and responds.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {personalities.map((personality) => (
          <div
            key={personality.id}
            className={clsx(
              'flex flex-col gap-3 rounded-xl border p-4 shadow-sm transition md:flex-row md:items-center md:justify-between',
              personality.id === activeId
                ? 'border-sky-400 bg-sky-500/10 dark:border-sky-500/70 dark:bg-sky-500/10'
                : 'border-slate-200/70 bg-slate-100 hover:border-slate-300 hover:bg-slate-200/70 dark:border-slate-900/60 dark:bg-slate-900/40 dark:hover:border-slate-800 dark:hover:bg-slate-900/60'
            )}
          >
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                {personality.label}
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                {personality.tone}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {personality.defaultVoice}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className={clsx(
                'border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:border-slate-700',
                personality.id === activeId &&
                  'border-sky-400 text-sky-600 dark:border-sky-500/70 dark:text-sky-200'
              )}
              onClick={() => onSelectPersonality(personality)}
            >
              Set as default
            </Button>
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          onClick={onManagePresets}
        >
          Manage presets
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
