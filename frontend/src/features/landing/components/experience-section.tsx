import { Camera, Clock, Mic, Video } from 'lucide-react';
import { ControlPill } from './control-pill';
import { ExperienceStat } from './experience-stat';

export function ExperienceSection() {
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
