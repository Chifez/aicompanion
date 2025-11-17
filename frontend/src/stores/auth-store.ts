import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AuthLoginResponse,
  AuthRegisterResponse,
  AuthRefreshResponse,
  AuthSessionResponse,
} from '@/types/api';
import { apiClient, authClient } from '@/lib/api-client';

const STORAGE_KEY = 'neuralive-auth';
const MIN_PASSWORD_LENGTH = 8;

export type AuthCredentials = {
  email: string;
  password: string;
};

export type RegisterPayload = AuthCredentials & {
  name: string;
};

type AuthState = {
  session: AuthSessionResponse | null;
  isHydrated: boolean;
  setSession: (session: AuthSessionResponse) => void;
  clearSession: () => void;
  bootstrap: () => Promise<AuthSessionResponse | null>; // GET /auth/session
  login: (credentials: AuthCredentials) => Promise<AuthSessionResponse>;
  register: (payload: RegisterPayload) => Promise<AuthSessionResponse>;
  refresh: () => Promise<AuthSessionResponse>; // POST /auth/refresh
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
};

function assertPassword(password: string) {
  if (password.trim().length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
    );
  }
}

function extractErrorMessage(error: any): string {
  // Check if it's an axios error with a response
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  // Check if it's an axios error with a different structure
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  // Check if there's a message in the error itself
  if (error?.message) {
    return error.message;
  }
  // Default fallback
  return 'An unexpected error occurred. Please try again.';
}

const useAuthStoreBase = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      isHydrated: false,

      setSession: (session) => {
        set({ session, isHydrated: true });
      },

      clearSession: () => {
        set({ session: null });
      },

      bootstrap: async () => {
        // This must only run in the browser, where cookies are available.
        if (typeof window === 'undefined') {
          return null;
        }

        try {
          const { data } = await apiClient.get<{
            session: AuthSessionResponse;
          }>('/auth/session');
          get().setSession(data.session);
          return data.session;
        } catch (error) {
          // 401 means no valid session, clear state
          get().clearSession();
          return null;
        }
      },

      login: async ({ email, password }) => {
        assertPassword(password);
        try {
          const { data } = await authClient.post<AuthLoginResponse>(
            '/auth/login',
            {
              email,
              password,
            }
          );
          get().setSession(data.session);
          return data.session;
        } catch (error: any) {
          const errorMessage = extractErrorMessage(error);
          throw new Error(errorMessage);
        }
      },

      register: async ({ name, email, password }) => {
        assertPassword(password);
        try {
          const { data } = await authClient.post<AuthRegisterResponse>(
            '/auth/register',
            {
              name,
              email,
              password,
            }
          );
          get().setSession(data.session);
          return data.session;
        } catch (error: any) {
          const errorMessage = extractErrorMessage(error);
          throw new Error(errorMessage);
        }
      },

      refresh: async () => {
        // This must only run in the browser, where cookies are available.
        if (typeof window === 'undefined') {
          throw new Error('refresh is a client-only method');
        }

        try {
          const { data } = await authClient.post<AuthRefreshResponse>(
            '/auth/refresh',
            {}
          );
          get().setSession(data.session);
          return data.session;
        } catch (error: any) {
          // Refresh failed, clear session
          get().clearSession();
          throw error;
        }
      },

      logout: async () => {
        try {
          await apiClient.post('/auth/logout');
        } catch (error) {
          // Ignore network errors while logging out
        }
        get().clearSession();
      },

      isAuthenticated: () => {
        return Boolean(get().session);
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        // Only persist session (user info), no tokens
        session: state.session,
      }),
      onRehydrateStorage: () => {
        return (_state, error) => {
          if (error) {
            useAuthStoreBase.getState().clearSession();
          }
          useAuthStoreBase.setState({ isHydrated: true });
        };
      },
    }
  )
);

export const useAuthStore = useAuthStoreBase;

// Axios interceptor for auto-refresh on token expiration
let isRefreshing = false;
let refreshPromise: Promise<AuthSessionResponse> | null = null;

// No request interceptor needed - cookies are sent automatically with withCredentials: true

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    if (!response || !config) {
      return Promise.reject(error);
    }

    // Check if it's a token expiration error
    if (response.status === 401 && response.data?.code === 'token_expired') {
      // Prevent multiple simultaneous refresh calls
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = useAuthStore
          .getState()
          .refresh()
          .catch((err) => {
            // Refresh failed, clear session and redirect
            useAuthStore.getState().clearSession();
            // Only redirect if we're in the browser
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            throw err;
          });
      }

      try {
        await refreshPromise;
        isRefreshing = false;
        refreshPromise = null;

        // Retry original request with new access token cookie
        return apiClient(config);
      } catch (refreshError) {
        isRefreshing = false;
        refreshPromise = null;
        return Promise.reject(refreshError);
      }
    }

    // Other 401s (e.g., invalid credentials, token_missing) - clear session
    if (response.status === 401) {
      useAuthStore.getState().clearSession();
    }

    return Promise.reject(error);
  }
);
