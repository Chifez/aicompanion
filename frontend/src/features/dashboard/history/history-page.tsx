import * as React from 'react';
import { HistoryHeader } from './components/history-header';
import { TranscriptList } from './components/transcript-list';
import { TranscriptDialog } from './components/transcript-dialog';
import { FilterDialog } from './components/filter-dialog';
import { HistorySkeleton } from './components/history-skeleton';
import { useTranscripts } from './hooks/use-transcripts';
import { useTranscriptDetail } from './hooks/use-transcript-detail';
import { formatTranscriptDate } from './utils/format';
import type { TranscriptRecord } from './types';

export function HistoryPage() {
  const [search, setSearch] = React.useState('');
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<'replay' | 'download'>(
    'replay'
  );
  const [activeTranscript, setActiveTranscript] =
    React.useState<TranscriptRecord | null>(null);

  const transcriptsQuery = useTranscripts();
  const transcriptDetailQuery = useTranscriptDetail(
    activeTranscript?.id ?? null
  );

  React.useEffect(() => {
    if (transcriptDetailQuery.data && activeTranscript) {
      const detail = transcriptDetailQuery.data.transcript;
      const snippet =
        detail.highlights[0]?.summary ??
        detail.sections
          .slice(0, 2)
          .map((section) => `${section.speaker}: ${section.text}`)
          .join('\n\n');
      setActiveTranscript((previous) =>
        previous && previous.id === activeTranscript.id
          ? { ...previous, summary: snippet }
          : previous
      );
    }
  }, [transcriptDetailQuery.data, activeTranscript?.id]);

  if (transcriptsQuery.isLoading) {
    return <HistorySkeleton />;
  }

  if (transcriptsQuery.isError) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-4 py-24 text-center text-slate-300">
        <p className="text-lg font-semibold">
          Unable to load transcript history.
        </p>
        <p className="text-sm text-slate-400">
          {(transcriptsQuery.error as Error)?.message ??
            'Please refresh the page or try again later.'}
        </p>
      </div>
    );
  }

  const transcriptRecords: TranscriptRecord[] =
    transcriptsQuery.data?.transcripts.map((transcript) => ({
      id: transcript.id,
      title: transcript.title,
      date: formatTranscriptDate(
        transcript.createdAt,
        transcript.durationMinutes
      ),
      summary:
        transcript.keywords.slice(0, 2).join(', ') ||
        'AI companion session summary available.',
      tags: transcript.keywords.slice(0, 3),
    })) ?? [];

  const filteredTranscripts = transcriptRecords.filter((transcript) => {
    const query = search.toLowerCase();
    return (
      transcript.title.toLowerCase().includes(query) ||
      transcript.summary.toLowerCase().includes(query) ||
      transcript.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 text-slate-900 dark:text-slate-100">
      <HistoryHeader
        search={search}
        onSearchChange={setSearch}
        onFilter={() => setFilterOpen(true)}
        onExportAll={() => {
          setDialogMode('download');
          setActiveTranscript({
            id: 'export-all',
            title: 'Full transcript export',
            date: 'All sessions',
            summary:
              'A bulk export request has been queued for your entire transcript history.',
            tags: [],
          });
        }}
      />

      <TranscriptList
        transcripts={filteredTranscripts}
        onReplay={(transcript) => {
          setDialogMode('replay');
          setActiveTranscript(transcript);
        }}
        onDownload={(transcript) => {
          setDialogMode('download');
          setActiveTranscript(transcript);
        }}
      />

      <TranscriptDialog
        open={Boolean(activeTranscript)}
        onOpenChange={(open) => {
          if (!open) {
            setActiveTranscript(null);
          }
        }}
        transcript={activeTranscript}
        mode={dialogMode}
      />

      <FilterDialog open={filterOpen} onOpenChange={setFilterOpen} />
    </div>
  );
}
