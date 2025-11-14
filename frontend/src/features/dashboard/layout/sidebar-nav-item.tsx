import { Link, useMatchRoute } from '@tanstack/react-router';
import type { ComponentType, SVGProps } from 'react';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

type SidebarNavItemProps = {
  to: string;
  title: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export function SidebarNavItem({ to, title, icon: Icon }: SidebarNavItemProps) {
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
