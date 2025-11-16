import {
  HeadContent,
  Scripts,
  createRootRoute,
  useRouterState,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { Toaster } from 'sonner';
import { NotFoundPage } from '@/features/shared/not-found-page';

import appCss from '../styles.css?url';

type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'NeuraLive | Real-Time AI Companion',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  notFoundComponent: NotFoundPage,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const isDev = import.meta.env.DEV;
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return 'dark';
    }
    return (window.localStorage.getItem('theme-preference') as Theme) ?? 'dark';
  });
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle('dark', theme === 'dark');
    document.body.dataset.theme = theme;
    window.localStorage.setItem('theme-preference', theme);
  }, [theme]);

  const setTheme = (next: Theme) => setThemeState(next);

  const toggleTheme = () =>
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme]
  );

  const hideFooter =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/lobby') ||
    pathname.includes('/meeting') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register');

  return (
    <html lang="en" className={theme === 'dark' ? 'dark' : ''}>
      <head>
        <HeadContent />
      </head>
      <body
        data-theme={theme}
        className="bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100"
      >
        <QueryClientProvider client={queryClient}>
          <ThemeContext.Provider value={value}>
            <div className="min-h-screen flex flex-col">
              <div className="grid-background pointer-events-none fixed inset-0 -z-10 opacity-20" />
              <main className="flex-1">{children}</main>
              {!hideFooter ? (
                <footer className="border-t border-slate-200/70 bg-white/80 text-slate-500 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/80 dark:text-slate-400">
                  <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-sm">
                    <span>© {new Date().getFullYear()} NeuraLive Labs</span>
                    <div className="flex items-center gap-4">
                      <a
                        href="#privacy"
                        className="hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        Privacy
                      </a>
                      <a
                        href="#terms"
                        className="hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        Terms
                      </a>
                    </div>
                  </div>
                </footer>
              ) : null}
            </div>
          </ThemeContext.Provider>

          {isDev ? (
            <TanStackDevtools
              config={{
                position: 'bottom-right',
              }}
              plugins={[
                {
                  name: 'Tanstack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                },
              ]}
            />
          ) : null}
        </QueryClientProvider>
        <Toaster position="top-right" richColors />
        <Scripts />
      </body>
    </html>
  );
}
