import { createFileRoute } from '@tanstack/react-router';
import { HistoryPage } from '@/features/dashboard/history/history-page';

export const Route = createFileRoute('/dashboard/history')({
  component: HistoryPage,
});
