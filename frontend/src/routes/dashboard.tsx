import clsx from 'clsx';
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
  useSidebar,
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
      <DashboardShell />
    </SidebarProvider>
  );
}

function DashboardShell() {
  const { state } = useSidebar();
  const isCollapsed = state !== 'expanded';

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="border-r border-slate-200/70 bg-white overflow-hidden dark:border-slate-900/60 dark:bg-slate-950"
      >
        <SidebarHeader
          className={clsx(
            'gap-4 px-4 py-6 bg-slate-50 dark:bg-slate-950 transition-colors',
            isCollapsed && 'items-center'
          )}
        >
          <div
            className={clsx(
              'flex items-center transition-all',
              isCollapsed ? 'justify-center gap-0' : 'gap-3'
            )}
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500 text-sm font-semibold text-slate-900">
              NL
            </span>
            {!isCollapsed && (
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  NeuraLive
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Realtime Companion
                </p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <Badge
              variant="outline"
              className="bg-slate-100 text-xs text-slate-600 dark:bg-slate-900/60 dark:text-slate-300"
            >
              <Sparkle className="mr-1 h-3 w-3" /> Prototype
            </Badge>
          )}
        </SidebarHeader>
        <SidebarContent className="bg-slate-50 dark:bg-slate-950 overflow-x-hidden">
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
                      className="justify-start gap-2 text-left text-xs text-slate-600 transition-colors hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-slate-100 data-[active=true]:bg-sky-500/20 data-[active=true]:text-sky-600 dark:data-[active=true]:bg-sky-500/25 dark:data-[active=true]:text-sky-200"
                    >
                      <div className="flex w-full items-center gap-2 rounded-md border border-slate-200/70 bg-slate-100 px-2 py-3 dark:border-slate-800/60 dark:bg-slate-900/60">
                        <CalendarClock className="h-4 w-4 text-slate-500" />
                        {!isCollapsed && (
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {meeting.title}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {meeting.time}
                            </span>
                          </div>
                        )}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-slate-200/70 bg-white dark:border-slate-900/60 dark:bg-slate-950">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className={clsx(
                  'flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200/70 bg-slate-100 px-3 py-2 transition-colors hover:border-slate-300 hover:bg-slate-200/70 dark:border-transparent dark:bg-slate-900 dark:hover:bg-slate-900/80',
                  isCollapsed ? 'justify-center' : 'justify-between'
                )}
              >
                <div
                  className={clsx(
                    'flex items-center gap-3 transition-all',
                    isCollapsed && 'justify-center gap-0'
                  )}
                >
                  <Avatar className="h-9 w-9 border border-slate-300 dark:border-slate-800">
                    <AvatarImage
                      src="https://avatar.vercel.sh/user"
                      alt="User avatar"
                    />
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="grid leading-tight">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        Alex Rivera
                      </span>
                      <span className="text-xs text-slate-500">
                        Product Lead
                      </span>
                    </div>
                  )}
                </div>
                {!isCollapsed && (
                  <Monitor className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                )}
              </div>
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
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-slate-50 dark:bg-slate-950">
        <DashboardTopBar />
        <div className="flex-1 overflow-y-auto px-6 pb-12 pt-6">
          <Outlet />
        </div>
      </SidebarInset>
    </>
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
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={title}
        className="group flex items-center gap-3 rounded-md px-2 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-200/80 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/70 dark:hover:text-slate-100 data-[active=true]:bg-sky-500/20 data-[active=true]:text-sky-600 dark:data-[active=true]:bg-sky-500/25 dark:data-[active=true]:text-sky-200"
      >
        <Link to={to} className="flex w-full items-center gap-3">
          <Icon className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">{title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function DashboardTopBar() {
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
