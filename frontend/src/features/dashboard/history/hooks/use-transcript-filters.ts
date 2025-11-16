import * as React from 'react';
import type { TranscriptRecord } from '../types';

type FilterState = {
  strategyOnly: boolean;
  includeWellness: boolean;
  includeAttachments: boolean;
};

type UseTranscriptFiltersOptions = {
  transcripts: TranscriptRecord[];
  searchQuery: string;
  filters: FilterState;
};

export function useTranscriptFilters({
  transcripts,
  searchQuery,
  filters,
}: UseTranscriptFiltersOptions) {
  const filteredTranscripts = React.useMemo(() => {
    return transcripts.filter((transcript) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        transcript.title.toLowerCase().includes(query) ||
        transcript.summary.toLowerCase().includes(query) ||
        transcript.tags.some((tag) => tag.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // Apply filters
      if (filters.strategyOnly) {
        const isStrategy = transcript.tags.some((tag) =>
          tag.toLowerCase().includes('strategy')
        );
        if (!isStrategy) return false;
      }

      if (!filters.includeWellness) {
        const isWellness = transcript.tags.some((tag) =>
          tag.toLowerCase().includes('wellness')
        );
        if (isWellness) return false;
      }

      return true;
    });
  }, [transcripts, searchQuery, filters]);

  return filteredTranscripts;
}
