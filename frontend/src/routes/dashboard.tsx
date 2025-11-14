import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '@/features/dashboard/layout/dashboard-layout';
import { useAuthStore } from '@/stores/auth-store';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ location }) => {
    const auth = useAuthStore.getState();
    if (!auth.isAuthenticated()) {
      const redirectTo = `${location.pathname}${location.search ?? ''}${location.hash ?? ''}`;
      throw redirect({ to: '/login', search: { redirect: redirectTo } });
    }
  },
  component: DashboardLayout,
});
