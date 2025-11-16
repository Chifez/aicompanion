import * as React from 'react';
import { HistoryHeader } from './components/history-header';
import { TranscriptList } from './components/transcript-list';
import { ReplayDialog } from './components/replay-dialog';
import { ExportDialog } from './components/export-dialog';
import { FilterDialog } from './components/filter-dialog';
import { HistorySkeleton } from './components/history-skeleton';
import { useTranscripts } from './hooks/use-transcripts';
import { useTranscriptDetail } from './hooks/use-transcript-detail';
import { useTranscriptFilters } from './hooks/use-transcript-filters';
import { formatTranscriptDate } from './utils/format';
import { handleTranscriptExportWithToast } from './utils/export-transcript';
import type { TranscriptRecord } from './types';
import { useDialogState } from '@/hooks/use-dialog-state';

export function HistoryPage() {
  const [search, setSearch] = React.useState('');
  const [filters, setFilters] = React.useState({
    strategyOnly: false,
    includeWellness: true,
    includeAttachments: true,
  });
  const [replayTranscriptId, setReplayTranscriptId] = React.useState<
    string | null
  >(null);
  const [exportTranscript, setExportTranscript] =
    React.useState<TranscriptRecord | null>(null);

  const filterDialog = useDialogState(false);
  const replayDialog = useDialogState(false);
  const exportDialog = useDialogState(false);

  const transcriptsQuery = useTranscripts();
  const transcriptDetailQuery = useTranscriptDetail(replayTranscriptId);
  const transcriptRecords: TranscriptRecord[] = React.useMemo(
    () =>
      transcriptsQuery.data?.transcripts.map((transcript) => ({
        id: transcript.id,
        title: transcript.title,
        date: formatTranscriptDate(
          transcript.createdAt,
          transcript.durationMinutes
        ),
        summary:
          (transcript.keywords && transcript.keywords.length > 0
            ? transcript.keywords.slice(0, 2).join(', ')
            : null) || 'AI companion session summary available.',
        tags:
          transcript.keywords && transcript.keywords.length > 0
            ? transcript.keywords.slice(0, 3)
            : [],
      })) ?? [],
    [transcriptsQuery.data]
  );

  const filteredTranscripts = useTranscriptFilters({
    transcripts: transcriptRecords,
    searchQuery: search,
    filters,
  });

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

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 text-slate-900 dark:text-slate-100">
      <HistoryHeader
        search={search}
        onSearchChange={setSearch}
        onFilter={filterDialog.openDialog}
        onExportAll={() => {
          setExportTranscript({
            id: 'export-all',
            title: 'Full transcript export',
            date: 'All sessions',
            summary: '',
            tags: [],
          });
          exportDialog.openDialog();
        }}
      />

      {filteredTranscripts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200/70 bg-slate-100 py-16 text-center dark:border-slate-900/60 dark:bg-slate-900/40">
          <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">
            No transcripts found
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {search ||
            Object.values(filters).some((v) => v !== false && v !== true)
              ? 'Try adjusting your search or filters'
              : 'Your conversation history will appear here once you start having sessions with your AI companion.'}
          </p>
        </div>
      ) : (
        <TranscriptList
          transcripts={filteredTranscripts}
          onReplay={(transcript) => {
            setReplayTranscriptId(transcript.id);
            replayDialog.openDialog();
          }}
          onDownload={(transcript) => {
            setExportTranscript(transcript);
            exportDialog.openDialog();
          }}
        />
      )}

      <ReplayDialog
        open={replayDialog.open}
        onOpenChange={(open) => {
          replayDialog.setOpen(open);
          if (!open) {
            setReplayTranscriptId(null);
          }
        }}
        transcript={transcriptDetailQuery.data ?? null}
      />

      <ExportDialog
        open={exportDialog.open}
        onOpenChange={exportDialog.setOpen}
        transcriptTitle={exportTranscript?.title}
        isBulkExport={exportTranscript?.id === 'export-all'}
        onConfirm={async () => {
          await handleTranscriptExportWithToast({
            transcriptId: exportTranscript?.id,
            transcriptTitle: exportTranscript?.title,
            transcripts: transcriptsQuery.data?.transcripts,
          });
          exportDialog.closeDialog();
        }}
      />

      <FilterDialog
        open={filterDialog.open}
        onOpenChange={filterDialog.setOpen}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
}
