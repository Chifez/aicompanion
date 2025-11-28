import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface AuthFormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  rightElement?: ReactNode;
  helperText?: string;
}

export function AuthFormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  minLength,
  rightElement,
  helperText,
}: AuthFormFieldProps) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-xs uppercase tracking-[0.3em] text-slate-400"
      >
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          className="border-slate-700 bg-slate-950/60 pr-12 text-slate-100 placeholder:text-slate-500 focus:border-sky-500"
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightElement}
          </div>
        )}
      </div>
      {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}
