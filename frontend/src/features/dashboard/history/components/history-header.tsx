import { Download, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type HistoryHeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onFilter: () => void;
  onExportAll: () => void;
};

export function HistoryHeader({
  search,
  onSearchChange,
  onFilter,
  onExportAll,
}: HistoryHeaderProps) {
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
