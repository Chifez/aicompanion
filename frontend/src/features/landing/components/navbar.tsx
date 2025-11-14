import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from '@/routes/__root';

export function Navbar() {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handler = () => {
      setCollapsed(window.scrollY > 24);
    };
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const wrapperClasses = collapsed
    ? 'max-w-4xl rounded-full px-5 py-2 shadow-[0_12px_35px_rgba(148,163,184,0.25)] dark:shadow-[0_12px_35px_rgba(15,23,42,0.35)]'
    : 'max-w-6xl rounded-2xl px-6 py-3';

  return (
    <header className="fixed inset-x-0 top-0 z-20 px-4 py-4 sm:px-8 lg:px-12">
      <div
        className={[
          'mx-auto flex items-center justify-between border border-slate-200/70 bg-white/85 text-slate-900 backdrop-blur transition-all duration-300 dark:border-slate-900/60 dark:bg-slate-950/80 dark:text-slate-100',
          wrapperClasses,
        ].join(' ')}
      >
        <Link to="/" className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500 text-sm font-semibold text-slate-950">
            NL
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-wide">NeuraLive</p>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Realtime companion
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800/60 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:text-slate-100"
          >
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-100 transition dark:border-sky-500/30 bg-sky-500 hover:bg-sky-400"
          >
            Sign in
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
