import { Download, PlayCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { TranscriptRecord } from '../types';

type TranscriptListProps = {
  transcripts: TranscriptRecord[];
  onReplay: (transcript: TranscriptRecord) => void;
  onDownload: (transcript: TranscriptRecord) => void;
};

export function TranscriptList({
  transcripts,
  onReplay,
  onDownload,
}: TranscriptListProps) {
  return (
    <section className="space-y-4">
      {transcripts.map((transcript) => (
        <Card
          key={transcript.id}
          className="border-slate-200/70 bg-white shadow-sm dark:border-slate-900/60 dark:bg-slate-950/60"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base text-slate-900 dark:text-slate-100">
                {transcript.title}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                {transcript.date}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {transcript.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-slate-300 text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:border-slate-800/60 dark:text-slate-400"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardHeader>
          <Separator className="border-slate-900/60" />
          <CardContent className="flex flex-col gap-4 pt-4 text-sm text-slate-300 md:flex-row md:items-center md:justify-between">
            <p className="max-w-2xl text-slate-600 dark:text-slate-300">
              {transcript.summary}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                onClick={() => onReplay(transcript)}
              >
                <PlayCircle className="mr-1 h-4 w-4" />
                Replay
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                onClick={() => onDownload(transcript)}
              >
                <Download className="mr-1 h-4 w-4" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
