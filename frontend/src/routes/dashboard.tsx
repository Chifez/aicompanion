import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '@/features/dashboard/layout/dashboard-layout';
import { useAuthStore } from '@/stores/auth-store';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ location }) => {
    // This must only run in the browser, where cookies are available.
    if (typeof window === 'undefined') {
      return;
    }

    // Wait for hydration (bootstrap already called in root route)
    let store = useAuthStore.getState();
    let attempts = 0;
    while (!store.isHydrated && attempts < 10) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      store = useAuthStore.getState();
      attempts++;
    }

    // Simple check: if no session, redirect to login
    if (!store.isAuthenticated()) {
      const redirectTo = `${location.pathname}${location.hash ?? ''}`;
      throw redirect({ to: '/login', search: { redirect: redirectTo } });
    }
  },
  component: DashboardLayout,
});
