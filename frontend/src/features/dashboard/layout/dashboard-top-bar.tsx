import { Mic, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useTheme } from '@/routes/__root';
import { useAuthStore } from '@/stores/auth-store';
import { useInstantMeeting } from '@/features/dashboard/meetings/hooks/use-instant-meeting';

export function DashboardTopBar() {
  const { theme, toggleTheme } = useTheme();
  const { startInstantMeeting, isCreating } = useInstantMeeting();
  const userName = useAuthStore(
    (auth) => auth.session?.user?.name ?? 'NeuraLive Member'
  );

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200/70 bg-white/85 px-6 text-slate-900 backdrop-blur dark:border-slate-900/60 dark:bg-slate-950/80 dark:text-slate-100">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-slate-600 dark:text-slate-300" />
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
            Dashboard
          </p>
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Welcome back, {userName}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-xs text-slate-600 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-900/80"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-xs text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-900/80"
        >
          <Mic className="h-4 w-4" />
          Audio check: Ready
        </Button>
        <Button
          className="flex items-center gap-2 bg-sky-500 px-4 text-sm font-semibold text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={startInstantMeeting}
          disabled={isCreating}
        >
          {isCreating ? 'Creating...' : 'Start meeting'}
          <Video className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
