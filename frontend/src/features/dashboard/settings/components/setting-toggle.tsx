import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';

type SettingToggleProps = {
  icon: React.ReactNode;
  label: string;
  description: string;
  helper?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
};

export function SettingToggle({
  icon,
  label,
  description,
  helper,
  checked,
  onChange,
}: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/70 bg-slate-100 px-4 py-3 dark:border-slate-900/60 dark:bg-slate-900/40">
      <div className="flex flex-col gap-2 text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 text-slate-200">
            {icon}
          </span>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {label}
            </p>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>
        {helper ? (
          <Badge
            variant="outline"
            className="border-slate-300 text-[10px] text-slate-500 dark:border-slate-800/60 dark:text-slate-400"
          >
            {helper}
          </Badge>
        ) : null}
      </div>
      <Toggle
        aria-label={label}
        className="min-w-14 data-[state=on]:bg-sky-500 data-[state=on]:text-slate-950"
        pressed={checked}
        onPressedChange={onChange}
      >
        {checked ? 'On' : 'Off'}
      </Toggle>
    </div>
  );
}
