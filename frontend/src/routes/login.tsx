import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Chrome, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth-store';

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  // Ensure that if a user already has a valid session (store hydrated with tokens),
  // they are redirected away from the login page to their intended destination
  // or the dashboard.
  beforeLoad: async ({ search }) => {
    let attempts = 0;
    let auth = useAuthStore.getState();

    // Wait briefly for Zustand persist hydration to complete
    while (!auth.isHydrated && attempts < 10) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      auth = useAuthStore.getState();
      attempts++;
    }

    if (auth.isAuthenticated()) {
      const redirectPath =
        typeof search.redirect === 'string' ? search.redirect : '/dashboard';
      throw redirect({ to: redirectPath });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const redirectTo =
    typeof search.redirect === 'string' ? search.redirect : undefined;

  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('alex@example.com');
  const [password, setPassword] = useState('secret123');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => login({ email, password }),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      // Navigate to the correct path using router
      const targetPath =
        redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard';
      navigate({ to: targetPath });
    },
  });

  const disabled = mutation.isPending;
  const apiError =
    mutation.error instanceof Error ? mutation.error.message : null;
  const errorMessage = localError ?? apiError;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.15),rgba(15,23,42,1)_70%)] px-4 py-12 text-slate-100">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
      <Card className="relative z-10 w-full max-w-lg border-slate-800 bg-slate-900/60 shadow-2xl backdrop-blur">
        <CardHeader className="space-y-4">
          <CardTitle className="text-2xl font-semibold text-slate-100">
            Welcome back to NeuraLive
          </CardTitle>
          <CardDescription className="text-slate-400">
            Sign in to access your dashboard, sessions, and AI companion
            settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3">
            <Button
              type="button"
              variant="outline"
              disabled
              className="flex w-full items-center justify-center gap-2 border-slate-700 bg-transparent text-slate-100 opacity-50 cursor-not-allowed"
              title="Google authentication is not yet implemented"
            >
              <Chrome className="h-4 w-4" />
              Sign in with Google (Coming soon)
            </Button>
            <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-slate-500">
              <div className="h-px flex-1 bg-slate-700" />
              OR
              <div className="h-px flex-1 bg-slate-700" />
            </div>
          </div>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!acceptedTerms) {
                setLocalError('Please accept the terms to continue.');
                return;
              }
              setLocalError(null);
              mutation.mutate();
            }}
          >
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs uppercase tracking-[0.3em] text-slate-400"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                className="border-slate-700 bg-slate-950/60 text-slate-100 placeholder:text-slate-500 focus:border-sky-500"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-xs uppercase tracking-[0.3em] text-slate-400"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  className="border-slate-700 bg-slate-950/60 pr-12 text-slate-100 placeholder:text-slate-500 focus:border-sky-500"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-slate-200"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="h-4 w-4 rounded border border-slate-600 bg-transparent accent-sky-500"
              />
              <span>
                I agree to the{' '}
                <a href="#terms" className="text-sky-300 underline">
                  terms & conditions
                </a>{' '}
                and{' '}
                <a href="#privacy" className="text-sky-300 underline">
                  privacy policy
                </a>
                .
              </span>
            </label>

            {errorMessage ? (
              <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {errorMessage}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={disabled}
              className="w-full bg-sky-500 text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="flex items-center justify-center text-sm text-slate-400 gap-1">
            <span>Need an account?</span>
            <Link
              to="/register"
              search={(prev) => ({ redirect: redirectTo ?? prev?.redirect })}
              className="text-sky-300 transition hover:text-sky-200"
            >
              Create one
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
