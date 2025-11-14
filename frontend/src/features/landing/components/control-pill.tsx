type ControlPillProps = {
  label: string;
};

export function ControlPill({ label }: ControlPillProps) {
  return (
    <span className="inline-flex flex-1 items-center justify-center rounded-full bg-slate-200 px-3 py-2 text-xs font-medium text-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
      {label}
    </span>
  );
}
