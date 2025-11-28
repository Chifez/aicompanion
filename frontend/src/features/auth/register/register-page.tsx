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

const MIN_PASSWORD_LENGTH = 8;

export function RegisterPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { redirectTo } = useAuthRoute();
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
      const targetPath =
        redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard';
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
      title="Create your account"
      description="Join NeuraLive to co-host realtime sessions with your AI companion."
      gradient="bg-[radial-gradient(circle_at_top,rgba(186,230,253,0.2),rgba(15,23,42,1)_70%)]"
    >
      <AuthForm
        onSubmit={handleSubmit}
        isSubmitting={mutation.isPending}
        submitLabel="Create account"
        submittingLabel="Creating account…"
        termsCheckbox={{
          checked: acceptedTerms,
          onChange: setAcceptedTerms,
          label: (
            <>
              I accept the{' '}
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
          id="name"
          label="Full name"
          value={name}
          onChange={setName}
          placeholder="Jamie Rivera"
          required
        />
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
          placeholder="Create a strong password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          helperText={`Minimum ${MIN_PASSWORD_LENGTH} characters.`}
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
        prompt="Already have an account?"
        linkText="Sign in"
        linkTo="/login"
        redirectTo={redirectTo}
      />
    </AuthWrapper>
  );
}
