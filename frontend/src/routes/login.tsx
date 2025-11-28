import { createFileRoute } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth-store';
import { LoginPage } from '@/features/auth/login/login-page';
import { useAuthGuard } from '@/features/auth/hooks/use-auth-guard';

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: async ({ search }) => {
    let attempts = 0;
    let auth = useAuthStore.getState();

    // Wait briefly for Zustand persist hydration to complete
    while (!auth.isHydrated && attempts < 10) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      auth = useAuthStore.getState();
      attempts++;
    }

    useAuthGuard(search);
  },
  component: LoginPage,
});
