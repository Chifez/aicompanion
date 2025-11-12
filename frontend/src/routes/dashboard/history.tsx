import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  HistoryHeader,
  TranscriptList,
  TranscriptRecord,
} from '@/components/dashboard/history-sections';
import {
  FilterDialog,
  TranscriptDialog,
} from '@/components/dashboard/history-modals';

const transcripts = [
  {
    id: 'session-112',
    title: 'Product strategy sync',
    date: 'Nov 8 • 47 mins',
    summary:
      'Aligned on roadmap focus areas, captured stakeholder concerns, drafted next steps.',
    tags: ['Strategy', 'Product'],
  },
  {
    id: 'session-111',
    title: 'Evening reflection: EQ training',
    date: 'Nov 6 • 24 mins',
    summary:
      'Practiced active listening cues, emotional mirroring, grounding language.',
    tags: ['Wellness', 'Soft Skills'],
  },
  {
    id: 'session-110',
    title: 'Launch rehearsal',
    date: 'Nov 4 • 32 mins',
    summary:
      'Script refinement, tone feedback, storytelling pivots captured for follow-up.',
    tags: ['Launch', 'Storytelling'],
  },
];

export const Route = createFileRoute('/dashboard/history')({
  component: HistoryPage,
});

function HistoryPage() {
  const [search, setSearch] = React.useState('');
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [activeTranscript, setActiveTranscript] =
    React.useState<TranscriptRecord | null>(null);
  const [dialogMode, setDialogMode] = React.useState<'replay' | 'download'>(
    'replay'
  );

  const filteredTranscripts = transcripts.filter((transcript) => {
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
          if (!open) setActiveTranscript(null);
        }}
        transcript={activeTranscript}
        mode={dialogMode}
      />

      <FilterDialog open={filterOpen} onOpenChange={setFilterOpen} />
    </div>
  );
}
