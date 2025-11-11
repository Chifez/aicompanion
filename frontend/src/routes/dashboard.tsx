import {
  createFileRoute,
  Link,
  Outlet,
  useMatchRoute,
  useNavigate,
} from '@tanstack/react-router';
import {
  CalendarClock,
  Gauge,
  History,
  Mic,
  Monitor,
  Settings2,
  Sparkle,
  Video,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useTheme } from '@/routes/__root';

const NAV_ITEMS = [
  {
    title: 'Overview',
    to: '/dashboard',
    icon: Gauge,
  },
  {
    title: 'Meetings',
    to: '/dashboard/meetings',
    icon: Video,
  },
  {
    title: 'Settings',
    to: '/dashboard/settings',
    icon: Settings2,
  },
  {
    title: 'History',
    to: '/dashboard/history',
    icon: History,
  },
];

const UPCOMING_MEETINGS = [
  { id: 'daily-standup', title: 'Focus Session', time: 'Today · 2:30 PM' },
  { id: 'weekly-sync', title: 'Weekly Retro', time: 'Thu · 4:00 PM' },
];

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <SidebarProvider className="bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar
        collapsible="icon"
        className="border-r border-slate-200/70 bg-white dark:border-slate-900/60 dark:bg-slate-950"
      >
        <SidebarHeader className="gap-4 px-4 py-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500 text-sm font-semibold text-slate-900">
              NL
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                NeuraLive
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Realtime Companion
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="bg-slate-100 text-xs text-slate-600 dark:bg-slate-900/60 dark:text-slate-300"
          >
            <Sparkle className="mr-1 h-3 w-3" /> Prototype
          </Badge>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => (
                  <SidebarNavItem key={item.to} {...item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>Next up</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {UPCOMING_MEETINGS.map((meeting) => (
                  <SidebarMenuItem key={meeting.id}>
                    <SidebarMenuButton
                      asChild
                      size="sm"
                      className="justify-start gap-2 text-left text-xs text-slate-600 dark:text-slate-300"
                    >
                      <div className="flex w-full items-center gap-2 rounded-md border border-slate-200/70 bg-slate-100 px-2 py-2 dark:border-slate-800/60 dark:bg-slate-900/60">
                        <CalendarClock className="h-4 w-4 text-slate-500" />
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {meeting.title}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {meeting.time}
                          </span>
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-slate-200/70 bg-white dark:border-slate-900/60 dark:bg-slate-900/70">
          <div className="flex items-center justify-between rounded-lg border border-slate-200/70 bg-slate-100 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-slate-300 dark:border-slate-800">
                <AvatarImage
                  src="https://avatar.vercel.sh/user"
                  alt="User avatar"
                />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <div className="grid leading-tight">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  Alex Rivera
                </span>
                <span className="text-xs text-slate-500">Product Lead</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-600 dark:text-slate-300"
                >
                  <Monitor className="h-4 w-4" />
                  <span className="sr-only">Account menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuItem>Switch workspace</DropdownMenuItem>
                <DropdownMenuItem>Notifications</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-400 hover:text-red-300">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-slate-50 dark:bg-slate-950">
        <TopBar />
        <div className="flex-1 overflow-y-auto px-6 pb-12 pt-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function SidebarNavItem({
  to,
  title,
  icon: Icon,
}: {
  to: string;
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  const matchRoute = useMatchRoute();

  const isActive = !!matchRoute({ to, fuzzy: to !== '/dashboard' });

  return (
    <SidebarMenuItem key={to}>
      <SidebarMenuButton asChild isActive={isActive} tooltip={title}>
        <Link
          to={to}
          className="flex items-center gap-3 text-slate-700 dark:text-slate-100"
        >
          <Icon className="h-4 w-4" />
          <span>{title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function TopBar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200/70 bg-white/85 px-6 text-slate-900 backdrop-blur dark:border-slate-900/60 dark:bg-slate-950/80 dark:text-slate-100">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-slate-600 dark:text-slate-300" />
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
            Dashboard
          </p>
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Welcome back, Alex
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
          className="flex items-center gap-2 bg-sky-500 px-4 text-sm font-semibold text-slate-950 hover:bg-sky-400"
          onClick={() => navigate({ to: '/lobby' })}
        >
          Start meeting
          <Video className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
