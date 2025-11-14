import { createFileRoute } from '@tanstack/react-router';
import { DashboardOverviewPage } from '@/features/dashboard/overview/dashboard-overview-page';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardOverviewPage,
});
