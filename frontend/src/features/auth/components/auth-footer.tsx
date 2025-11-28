import { Link } from '@tanstack/react-router';

interface AuthFooterProps {
  prompt: string;
  linkText: string;
  linkTo: string;
  redirectTo?: string;
}

export function AuthFooter({
  prompt,
  linkText,
  linkTo,
  redirectTo,
}: AuthFooterProps) {
  return (
    <div className="flex items-center justify-center text-sm text-slate-400 gap-1">
      <span>{prompt}</span>
      <Link
        to={linkTo}
        search={(prev) => ({ redirect: redirectTo ?? prev?.redirect })}
        className="text-sky-300 transition hover:text-sky-200"
      >
        {linkText}
      </Link>
    </div>
  );
}
