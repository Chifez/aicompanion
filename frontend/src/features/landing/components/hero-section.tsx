import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative px-6 pb-20 pt-32 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-200/70 px-4 py-2 text-sm text-slate-700 ring-1 ring-sky-500/30 dark:bg-slate-900/70 dark:text-slate-300">
          <span className="inline-flex h-2 w-2 rounded-full bg-sky-400" />
          Realtime AI Presence
        </span>
        <div className="mt-8 max-w-3xl space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl lg:text-[3.25rem]">
            Hold a conversation with an AI that feels grounded, present, and
            fully alive.
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 sm:text-xl">
            NeuraLive blends OpenAI’s realtime reasoning with a responsive video
            co-host. Connect in seconds, talk freely, and get real support that
            adapts to your energy.
          </p>
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link
            to="/login"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-sky-500 px-6 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-sky-400"
          >
            Sign in
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/register"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-300 px-6 text-sm font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500"
          >
            Create account
          </Link>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            No credit card · Live transcript · Private by default
          </span>
        </div>
      </div>
    </section>
  );
}
