import { useState } from 'react';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Chrome, Eye, EyeOff } from 'lucide-react';
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

const MIN_PASSWORD_LENGTH = 8;

export const Route = createFileRoute('/register')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: ({ search }) => {
    const auth = useAuthStore.getState();
    if (auth.isAuthenticated()) {
      const redirectPath =
        typeof search.redirect === 'string' ? search.redirect : '/dashboard/';
      throw redirect({ to: redirectPath });
    }
  },
  component: RegisterPage,
});

function RegisterPage() {
  const queryClient = useQueryClient();
  const search = Route.useSearch();
  const redirectTo =
    typeof search.redirect === 'string' ? search.redirect : undefined;

  const register = useAuthStore((state) => state.register);

  const [name, setName] = useState('Test User');
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('strongpass123');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => register({ name, email, password }),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      // Ensure we navigate to the correct path
      const targetPath =
        redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard/';
      // Use window.location for reliable navigation after auth state update
      window.location.href = targetPath;
    },
  });

  const disabled = mutation.isPending;
  const apiError =
    mutation.error instanceof Error ? mutation.error.message : null;
  const errorMessage = localError ?? apiError;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(186,230,253,0.2),rgba(15,23,42,1)_70%)] px-4 py-12 text-slate-100">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
      <Card className="relative z-10 w-full max-w-xl border-slate-800 bg-slate-900/60 shadow-2xl backdrop-blur">
        <CardHeader className="space-y-4">
          <CardTitle className="text-2xl font-semibold text-slate-100">
            Create your account
          </CardTitle>
          <CardDescription className="text-slate-400">
            Join NeuraLive to co-host realtime sessions with your AI companion.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex w-full items-center justify-center gap-2 border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800"
              onClick={() => {
                window.open('/auth/google', '_self');
              }}
            >
              <Chrome className="h-4 w-4" />
              Sign up with Google
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
                htmlFor="name"
                className="text-xs uppercase tracking-[0.3em] text-slate-400"
              >
                Full name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Jamie Rivera"
                required
                className="border-slate-700 bg-slate-950/60 text-slate-100 placeholder:text-slate-500 focus:border-sky-500"
              />
            </div>
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
                  minLength={MIN_PASSWORD_LENGTH}
                  required
                  placeholder="Create a strong password"
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
              <p className="text-xs text-slate-500">
                Minimum {MIN_PASSWORD_LENGTH} characters.
              </p>
            </div>
            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="h-4 w-4 rounded border border-slate-600 bg-transparent accent-sky-500"
              />
              <span>
                I accept the{' '}
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
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </form>

          <div className="flex items-center justify-center text-sm text-slate-400 gap-1">
            <span>Already have an account?</span>
            <Link
              to="/login"
              search={(prev) => ({ redirect: redirectTo ?? prev?.redirect })}
              className="text-sky-300 transition hover:text-sky-200"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
