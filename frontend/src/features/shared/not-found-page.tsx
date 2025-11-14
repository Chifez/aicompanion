import { Link } from '@tanstack/react-router';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 py-12 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-6xl font-bold text-slate-900 dark:text-slate-100">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300">
            Page not found
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            className="bg-sky-500 text-slate-950 hover:bg-sky-400"
          >
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
        </div>
      </div>
    </div>
  );
}
