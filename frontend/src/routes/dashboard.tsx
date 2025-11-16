import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '@/features/dashboard/layout/dashboard-layout';
import { useAuthStore } from '@/stores/auth-store';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ location }) => {
    // Wait for auth store to hydrate from localStorage
    // Zustand persist hydration is synchronous, but we need to ensure it's complete
    let attempts = 0;
    let auth = useAuthStore.getState();

    while (!auth.isHydrated && attempts < 10) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      auth = useAuthStore.getState();
      attempts++;
    }

    if (!auth.isAuthenticated()) {
      // Build redirect URL properly - only use pathname and hash, search params are handled separately
      const redirectTo = `${location.pathname}${location.hash ?? ''}`;
      throw redirect({ to: '/login', search: { redirect: redirectTo } });
    }
  },
  component: DashboardLayout,
});
