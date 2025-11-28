import { useState, FormEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { AuthWrapper } from '../components/auth-wrapper';
import { AuthForm } from '../components/auth-form';
import { AuthFormField } from '../components/auth-form-field';
import { AuthFooter } from '../components/auth-footer';
import { useAuthRoute } from '../hooks/use-auth-route';
import { sanitizeRedirectUrl } from '@/lib/url-utils';

export function LoginPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { redirectTo } = useAuthRoute();
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
      const targetPath = sanitizeRedirectUrl(redirectTo);
      navigate({ to: targetPath });
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setLocalError('Please accept the terms to continue.');
      return;
    }
    setLocalError(null);
    mutation.mutate();
  };

  const apiError =
    mutation.error instanceof Error ? mutation.error.message : null;
  const errorMessage = localError ?? apiError;

  return (
    <AuthWrapper
      title="Welcome back to NeuraLive"
      description="Sign in to access your dashboard, sessions, and AI companion settings."
    >
      <AuthForm
        onSubmit={handleSubmit}
        isSubmitting={mutation.isPending}
        submitLabel="Sign in"
        submittingLabel="Signing in…"
        termsCheckbox={{
          checked: acceptedTerms,
          onChange: setAcceptedTerms,
          label: (
            <>
              I agree to the{' '}
              <a href="#terms" className="text-sky-300 underline">
                terms & conditions
              </a>{' '}
              and{' '}
              <a href="#privacy" className="text-sky-300 underline">
                privacy policy
              </a>
              .
            </>
          ),
        }}
        errorMessage={errorMessage}
      >
        <AuthFormField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          required
        />
        <AuthFormField
          id="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          required
          rightElement={
            <button
              type="button"
              className="text-slate-400 transition hover:text-slate-200"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
        />
      </AuthForm>
      <AuthFooter
        prompt="Need an account?"
        linkText="Create one"
        linkTo="/register"
        redirectTo={redirectTo}
      />
    </AuthWrapper>
  );
}
