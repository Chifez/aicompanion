import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="px-6 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-[0_0_40px_rgba(14,165,233,0.08)] dark:border-slate-900 dark:bg-slate-950/70">
        <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
          Ready to co-host with your AI?
        </h2>
        <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
          Start a session in seconds. Join from your browser and meet your AI
          companion who listens, remembers, and adapts to you.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-slate-950 transition hover:bg-sky-400"
          >
            Enter dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500">
            Watch preview
          </button>
        </div>
      </div>
    </section>
  );
}
