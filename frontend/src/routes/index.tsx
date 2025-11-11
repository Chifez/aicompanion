import { Link, createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ArrowRight, Camera, Clock, Mic, Sparkle, Video } from 'lucide-react';
import { useTheme } from '@/routes/__root';

const highlights = [
  {
    icon: Sparkle,
    title: 'Human-like Presence',
    description:
      'ElevenLabs real-time voice paired with expressive visuals keeps conversations engaging.',
  },
  {
    icon: Video,
    title: 'Cinematic Meetings',
    description:
      'A dedicated meeting room designed for natural two-person interactions.',
  },
  {
    icon: Clock,
    title: 'Instant Responsiveness',
    description: 'Sub-second latency with WebRTC and OpenAI Realtime APIs.',
  },
];

const testimonials = [
  {
    name: 'Jordan W.',
    role: 'Product Coach',
    quote:
      '“NeuraLive feels less like an app and more like collaborating with an actual teammate.”',
  },
  {
    name: 'Tasha L.',
    role: 'Wellness Mentor',
    quote:
      '“The emotional attunement blew me away. It mirrors tone and energy seamlessly.”',
  },
];

export const Route = createFileRoute('/')({
  component: Landing,
});

function Landing() {
  useEffect(() => {
    document.body.classList.add('has-fixed-nav');
    return () => {
      document.body.classList.remove('has-fixed-nav');
    };
  }, []);

  return (
    <div className="relative overflow-hidden">
      <Navbar />
      <HeroSection />
      <HighlightsSection />
      <ExperienceSection />
      <TestimonialSection />
      <CTASection />
    </div>
  );
}

function HeroSection() {
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
            to="/dashboard"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-sky-500 px-6 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-sky-400"
          >
            Go to dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            No credit card · Live transcript · Private by default
          </span>
        </div>
      </div>
    </section>
  );
}

function HighlightsSection() {
  return (
    <section className="border-y border-slate-200/80 bg-white/80 px-6 py-14 text-slate-900 dark:border-slate-900/80 dark:bg-slate-950/60 dark:text-slate-100 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
        {highlights.map((highlight) => (
          <div
            key={highlight.title}
            className="group rounded-2xl border border-slate-200/60 bg-white/70 p-6 shadow-sm transition hover:border-sky-500/60 hover:bg-slate-50 dark:border-slate-800/60 dark:bg-slate-950/30 dark:hover:bg-slate-900/60"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/15 text-sky-500 ring-1 ring-sky-500/40">
              <highlight.icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {highlight.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {highlight.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExperienceSection() {
  return (
    <section className="px-6 py-20 text-slate-900 dark:text-slate-100 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Built for fluid, lifelike sessions.
          </h2>
          <p className="mt-4 max-w-xl text-base text-slate-600 dark:text-slate-300">
            From the lobby to the meeting room, NeuraLive keeps you centered.
            Seamless device checks, subtle lighting, and restrained color
            choices create a calm, inviting canvas for deep conversation with
            your AI companion.
          </p>
          <dl className="mt-8 grid gap-6 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2">
            <ExperienceStat
              icon={Mic}
              title="Voice tuned in"
              description="Automatic voice activity detection maintains smooth back-and-forth flow."
            />
            <ExperienceStat
              icon={Camera}
              title="Camera ready"
              description="Smart permission handling ensures your meeting starts with confidence."
            />
            <ExperienceStat
              icon={Video}
              title="Two-seat stage"
              description="Google Meet-inspired layout with the AI host in focus and you in frame."
            />
            <ExperienceStat
              icon={Clock}
              title="Always responsive"
              description="Optimized streaming stack keeps latency minimal even under load."
            />
          </dl>
        </div>
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-sky-500/20 blur-2xl dark:bg-sky-500/10" />
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-950/60">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Meeting Room Preview</span>
              <span className="inline-flex items-center gap-2">
                Live
                <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-sky-400" />
              </span>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="grid gap-3 p-4 sm:grid-cols-[2fr_1fr]">
                <div className="aspect-video rounded-xl bg-slate-200 dark:bg-slate-800/70" />
                <div className="flex flex-col justify-between gap-3">
                  <div className="aspect-video rounded-xl bg-slate-200 dark:bg-slate-800/70" />
                  <div className="flex gap-3">
                    <ControlPill label="Mute" />
                    <ControlPill label="Cam Off" />
                    <ControlPill label="Share" />
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
              A modern room designed around you and your AI partner.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ExperienceStat({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-950/50">
      <Icon className="h-5 w-5 text-sky-500 dark:text-sky-400" />
      <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

function ControlPill({ label }: { label: string }) {
  return (
    <span className="inline-flex flex-1 items-center justify-center rounded-full bg-slate-200 px-3 py-2 text-xs font-medium text-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
      {label}
    </span>
  );
}

function TestimonialSection() {
  return (
    <section className="border-y border-slate-200/80 bg-slate-50/80 px-6 py-16 text-slate-900 dark:border-slate-900/60 dark:bg-slate-950/60 dark:text-slate-100 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <h2 className="text-2xl font-semibold">
            Trusted by teams exploring new ways to connect.
          </h2>
          <p className="mt-3 max-w-xl text-sm text-slate-600 dark:text-slate-400">
            NeuraLive creates a space where your AI feels less like a bot and
            more like a collaborator, mentor, or companion.
          </p>
          <div className="mt-8 flex flex-col gap-6">
            {testimonials.map((testimonial) => (
              <blockquote
                key={testimonial.name}
                className="rounded-2xl border border-slate-200/70 bg-white/85 p-6 text-sm text-slate-700 shadow-sm dark:border-slate-800/60 dark:bg-slate-950/50 dark:text-slate-300"
              >
                <p>{testimonial.quote}</p>
                <footer className="mt-4 text-xs text-slate-500 dark:text-slate-500">
                  {testimonial.name} · {testimonial.role}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200/70 bg-white/85 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-950/50">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Live Sessions
          </h3>
          <div className="mt-6 space-y-4 text-sm text-slate-700 dark:text-slate-300">
            <div className="flex items-center justify-between">
              <span>Daily conversations</span>
              <span>1,248</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Average response time</span>
              <span>240 ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Voice styles</span>
              <span>14</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
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
            to="/dashboard"
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

function Navbar() {
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
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-100 transition hover:bg-slate-800 dark:border-sky-500/30 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
          >
            Dashboard
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
