import { useSearch } from '@tanstack/react-router';

export function useAuthRoute() {
  const search = useSearch({ strict: false });
  const redirectTo =
    typeof search.redirect === 'string' ? search.redirect : undefined;

  return { redirectTo };
}
