import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth-store';
import { RegisterPage } from '@/features/auth/register/register-page';

export const Route = createFileRoute('/register')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: ({ search }) => {
    const auth = useAuthStore.getState();
    if (auth.isAuthenticated()) {
      const redirectPath =
        typeof search.redirect === 'string'
          ? decodeURIComponent(search.redirect)
          : '/dashboard';
      throw redirect({ to: redirectPath });
    }
  },
  component: RegisterPage,
});
