import { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Chrome } from 'lucide-react';

interface AuthWrapperProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  gradient?: string;
}

export function AuthWrapper({
  title,
  description,
  children,
  footer,
  gradient = 'bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.15),rgba(15,23,42,1)_70%)]',
}: AuthWrapperProps) {
  return (
    <div
      className={`relative flex min-h-screen items-center justify-center ${gradient} px-4 py-12 text-slate-100`}
    >
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
      <Card className="relative z-10 w-full max-w-lg border-slate-800 bg-slate-900/60 shadow-2xl backdrop-blur">
        <CardHeader className="space-y-4">
          <CardTitle className="text-2xl font-semibold text-slate-100">
            {title}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {description}
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
          {children}
          {footer && <div className="mt-4">{footer}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
