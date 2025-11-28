import { ReactNode, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AuthFormProps {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  submitLabel: string;
  submittingLabel: string;
  children: ReactNode;
  termsCheckbox?: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: ReactNode;
  };
  errorMessage?: string | null;
}

export function AuthForm({
  onSubmit,
  isSubmitting,
  submitLabel,
  submittingLabel,
  children,
  termsCheckbox,
  errorMessage,
}: AuthFormProps) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {children}
      {termsCheckbox && (
        <label className="flex items-center gap-3 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={termsCheckbox.checked}
            onChange={(e) => termsCheckbox.onChange(e.target.checked)}
            className="h-4 w-4 rounded border border-slate-600 bg-transparent accent-sky-500"
          />
          <span>{termsCheckbox.label}</span>
        </label>
      )}
      {errorMessage && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {errorMessage}
        </p>
      )}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-sky-500 text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {submittingLabel}
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
