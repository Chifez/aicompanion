import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardShell } from './dashboard-shell';

export function DashboardLayout() {
  return (
    <SidebarProvider className="bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <DashboardShell />
    </SidebarProvider>
  );
}
