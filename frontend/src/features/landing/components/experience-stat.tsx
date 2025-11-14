import type { ComponentType, SVGProps } from 'react';

type ExperienceStatProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
};

export function ExperienceStat({
  icon: Icon,
  title,
  description,
}: ExperienceStatProps) {
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
