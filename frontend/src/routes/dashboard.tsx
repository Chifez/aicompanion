import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '@/features/dashboard/layout/dashboard-layout';
import { useAuthStore } from '@/stores/auth-store';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ location }) => {
    // In SSR / dev server environments there is no browser cookie store.
    // Skip auth guard here and let the client-side run it after hydration.
    if (typeof window === 'undefined') {
      return;
    }

    console.log('[dashboard.beforeLoad] start', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    });

    // Ensure the auth store has rehydrated from persisted state
    let attempts = 0;
    let store = useAuthStore.getState();

    while (!store.isHydrated && attempts < 10) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      store = useAuthStore.getState();
      attempts++;
      console.log('[dashboard.beforeLoad] waiting for hydration', {
        attempt: attempts,
        isHydrated: store.isHydrated,
        hasSession: !!store.session,
      });
    }

    // If we don't have a session yet but might have a refresh cookie,
    // try to refresh once to recover a session transparently.
    if (!store.session) {
      console.log(
        '[dashboard.beforeLoad] no authenticated session after hydration, trying refreshTokens'
      );
      try {
        await store.refreshTokens();
        store = useAuthStore.getState();
        console.log('[dashboard.beforeLoad] after refreshTokens', {
          hasSession: !!store.session,
        });
      } catch (e) {
        console.warn(
          '[dashboard.beforeLoad] refreshTokens threw, will redirect',
          e
        );
      }
    }

    if (!store.isAuthenticated()) {
      // Build redirect URL properly - only use pathname and hash, search params are handled separately
      const redirectTo = `${location.pathname}${location.hash ?? ''}`;
      console.warn(
        '[dashboard.beforeLoad] unauthenticated, redirecting to /login',
        { redirectTo }
      );
      throw redirect({ to: '/login', search: { redirect: redirectTo } });
    }

    console.log('[dashboard.beforeLoad] authenticated, proceeding');
  },
  component: DashboardLayout,
});
