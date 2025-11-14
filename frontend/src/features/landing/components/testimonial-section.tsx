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

export function TestimonialSection() {
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
