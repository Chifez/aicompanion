import * as React from 'react';
import clsx from 'clsx';
import { Outlet, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import {
  CalendarClock,
  Gauge,
  History,
  Monitor,
  Settings2,
  Sparkle,
  Video,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/stores/auth-store';
import { DashboardTopBar } from './dashboard-top-bar';
import { SidebarNavItem } from './sidebar-nav-item';
import { useMeetings } from '@/features/dashboard/meetings/hooks/use-meetings';
import { formatStartTime } from '@/features/dashboard/meetings/utils/format';

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

export function DashboardShell() {
  const { state } = useSidebar();
  const isCollapsed = state !== 'expanded';
  const user = useAuthStore((auth) => auth.session?.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = useAuthStore((auth) => auth.logout);
  const meetingsQuery = useMeetings();

  // Get upcoming meetings (next 2 scheduled meetings)
  const upcomingMeetings = React.useMemo(() => {
    if (!meetingsQuery.data?.scheduled) return [];
    const now = new Date();
    return meetingsQuery.data.scheduled
      .filter((meeting) => new Date(meeting.startTime) > now)
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )
      .slice(0, 2)
      .map((meeting) => ({
        id: meeting.id,
        title: meeting.title,
        time: formatStartTime(meeting.startTime),
      }));
  }, [meetingsQuery.data]);

  const handleSignOut = async () => {
    await logout();
    await queryClient.clear();
    navigate({ to: '/login', search: { redirect: undefined } });
  };

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
                {upcomingMeetings.length === 0 ? (
                  <SidebarMenuItem>
                    <div className="flex w-full items-center gap-2 rounded-md border border-slate-200/70 bg-slate-100 px-2 py-3 text-xs text-slate-500 dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-400">
                      {!isCollapsed && <span>No upcoming meetings</span>}
                      {isCollapsed && <CalendarClock className="h-4 w-4" />}
                    </div>
                  </SidebarMenuItem>
                ) : (
                  upcomingMeetings.map((meeting) => (
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
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-slate-200/70 bg-white dark:border-slate-900/60 dark:bg-slate-950">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className={clsx(
                  'flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200/70 px-3 py-2 transition-colors hover:border-slate-300  dark:border-transparent ',
                  isCollapsed
                    ? 'justify-center'
                    : 'justify-between bg-slate-100 dark:bg-slate-900 hover:bg-slate-200/70 dark:hover:bg-slate-900/80'
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
                      src={user?.avatarUrl || 'https://avatar.vercel.sh/user'}
                      alt={user?.name ?? 'User avatar'}
                    />
                    <AvatarFallback>
                      {user?.name?.charAt(0) ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="grid leading-tight">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {user?.name ?? 'NeuraLive Member'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {user?.planTier ? `${user.planTier} plan` : 'Workspace'}
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
              <DropdownMenuItem
                className="text-red-400 hover:text-red-300"
                onSelect={(event) => {
                  event.preventDefault();
                  void handleSignOut();
                }}
              >
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
