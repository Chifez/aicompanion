import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import type { TranscriptListResponse } from '@/types/api';

type TranscriptSummary = TranscriptListResponse['transcripts'][number];

type ExportOptions = {
  transcriptId?: string;
  transcriptTitle?: string;
  transcripts?: TranscriptSummary[];
};

export async function exportSingleTranscript(
  transcriptId: string,
  transcriptTitle: string
): Promise<void> {
  const response = await apiClient.get<{ transcript: any }>(
    `/history/${transcriptId}`
  );
  const transcriptData = response.data;

  if (!transcriptData || !transcriptData.transcript) {
    throw new Error('Transcript data not available');
  }

  const exportData = {
    exportedAt: new Date().toISOString(),
    transcript: transcriptData.transcript,
  };

  downloadJSON(
    exportData,
    `${sanitizeFilename(transcriptTitle)}-${transcriptId}.json`
  );
}

export async function exportAllTranscripts(
  transcripts: TranscriptSummary[]
): Promise<void> {
  if (transcripts.length === 0) {
    throw new Error('No transcripts to export');
  }

  const exportData = {
    exportedAt: new Date().toISOString(),
    totalTranscripts: transcripts.length,
    transcripts: transcripts.map((t) => ({
      id: t.id,
      title: t.title,
      createdAt: t.createdAt,
      durationMinutes: t.durationMinutes,
      sentimentScore: t.sentimentScore,
      keywords: t.keywords,
    })),
  };

  downloadJSON(
    exportData,
    `transcripts-export-${new Date().toISOString().split('T')[0]}.json`
  );
}

export async function handleTranscriptExport(
  options: ExportOptions
): Promise<void> {
  const { transcriptId, transcriptTitle, transcripts } = options;

  if (transcriptId === 'export-all' && transcripts) {
    await exportAllTranscripts(transcripts);
  } else if (transcriptId && transcriptTitle) {
    await exportSingleTranscript(transcriptId, transcriptTitle);
  } else {
    throw new Error('Invalid export options');
  }
}

export function handleTranscriptExportWithToast(
  options: ExportOptions
): Promise<void> {
  const { transcriptId } = options;
  const isBulk = transcriptId === 'export-all';
  const promise = handleTranscriptExport(options);

  toast.promise(promise, {
    loading: 'Preparing transcript export...',
    success: isBulk
      ? 'Transcripts exported successfully'
      : 'Transcript exported successfully',
    error: 'Failed to export transcript. Please try again.',
  });

  return promise;
}

function downloadJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '_');
}
