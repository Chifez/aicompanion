import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlayCircle, Pause, SkipForward, SkipBack } from 'lucide-react';
import type { TranscriptDetailResponse } from '@/types/api';
import { useResetOnClose } from '@/hooks/use-reset-on-close';

type ReplayDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transcript: TranscriptDetailResponse | null;
};

export function ReplayDialog({
  open,
  onOpenChange,
  transcript,
}: ReplayDialogProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);

  // Reset state when dialog closes
  useResetOnClose(open, 0, setCurrentSectionIndex);
  useResetOnClose(open, false, setIsPlaying);

  if (!transcript) {
    return null;
  }

  const sections = transcript.transcript.sections || [];
  const currentSection = sections[currentSectionIndex];
  const canGoBack = currentSectionIndex > 0;
  const canGoForward = currentSectionIndex < sections.length - 1;

  if (sections.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md space-y-4">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">
              Replay transcript: {transcript.transcript.summary.title}
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              No transcript sections available for replay.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-300"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const handlePrevious = () => {
    if (canGoBack) {
      setCurrentSectionIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (canGoForward) {
      setCurrentSectionIndex((prev) => prev + 1);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
    // TODO: Implement actual audio playback when audio files are available
    // For now, this just toggles the UI state
    if (!isPlaying) {
      // Would start audio playback here
      console.log('Play audio for section:', currentSectionIndex);
    } else {
      // Would pause audio playback here
      console.log('Pause audio');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto space-y-4">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            Replay transcript: {transcript.transcript.summary.title}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Navigate through the conversation sections and replay key moments.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Highlights */}
          {transcript.transcript.highlights &&
            transcript.transcript.highlights.length > 0 && (
              <div className="rounded-lg border border-slate-200/70 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <h4 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Key highlights
                </h4>
                <div className="space-y-2">
                  {transcript.transcript.highlights.map((highlight, idx) => (
                    <div
                      key={idx}
                      className="text-sm text-slate-600 dark:text-slate-300"
                    >
                      <span className="font-medium">{highlight.speaker}:</span>{' '}
                      {highlight.summary}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Current section */}
          <div className="rounded-lg border border-slate-200/70 bg-slate-100 p-6 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Section {currentSectionIndex + 1} of {sections.length}
              </div>
              <div className="text-xs text-slate-500">
                {Math.floor(currentSection?.timestampMs / 1000 / 60)}:
                {String(
                  Math.floor((currentSection?.timestampMs / 1000) % 60)
                ).padStart(2, '0')}
              </div>
            </div>
            <div className="mb-4">
              <div className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {currentSection?.speaker}
              </div>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                {currentSection?.text}
              </p>
            </div>

            {/* Playback controls */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={!canGoBack}
                className="h-9 w-9 p-0"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                onClick={handlePlayPause}
                className="h-10 w-10 rounded-full bg-sky-500 p-0 hover:bg-sky-400"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 text-slate-950" />
                ) : (
                  <PlayCircle className="h-5 w-5 text-slate-950" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={!canGoForward}
                className="h-9 w-9 p-0"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action items */}
          {transcript.transcript.actionItems &&
            transcript.transcript.actionItems.length > 0 && (
              <div className="rounded-lg border border-slate-200/70 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <h4 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Action items
                </h4>
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
                  {transcript.transcript.actionItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-300"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
