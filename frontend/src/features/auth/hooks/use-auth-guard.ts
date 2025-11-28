import { redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth-store';

export function useAuthGuard(search?: { redirect?: string }) {
  const auth = useAuthStore.getState();

  // Only redirect if hydrated and authenticated
  if (auth.isHydrated && auth.isAuthenticated()) {
    const redirectPath =
      typeof search?.redirect === 'string'
        ? decodeURIComponent(search.redirect)
        : '/dashboard';
    throw redirect({ to: redirectPath });
  }
}
