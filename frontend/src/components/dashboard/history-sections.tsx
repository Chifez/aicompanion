import { Download, Filter, PlayCircle, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export type TranscriptRecord = {
  id: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
};

export function HistoryHeader({
  search,
  onSearchChange,
  onFilter,
  onExportAll,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  onFilter: () => void;
  onExportAll: () => void;
}) {
  return (
    <header className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Conversation history
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Replay moments, export transcripts, and capture insights across
            sessions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900 dark:border-slate-800 dark:text-slate-200"
            onClick={onFilter}
          >
            <Filter className="mr-1 h-4 w-4" />
            Filters
          </Button>
          <Button
            size="sm"
            className="bg-sky-500 text-slate-950 hover:bg-sky-400"
            onClick={onExportAll}
          >
            <Download className="mr-1 h-4 w-4" />
            Export all
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-slate-100 px-3 py-2 dark:border-slate-900/60 dark:bg-slate-900/30">
        <Search className="h-4 w-4 text-slate-500" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search sessions, tags, participants..."
          className="border-none bg-transparent text-sm text-slate-700 placeholder:text-slate-500 focus-visible:ring-0 dark:text-slate-200"
        />
      </div>
    </header>
  );
}

export function TranscriptList({
  transcripts,
  onReplay,
  onDownload,
}: {
  transcripts: TranscriptRecord[];
  onReplay: (transcript: TranscriptRecord) => void;
  onDownload: (transcript: TranscriptRecord) => void;
}) {
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
