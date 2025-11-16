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
  accessToken: string | null;
  // refreshToken is no longer used on the client; it lives in an HttpOnly cookie
  expiresAt: number | null;
  session: AuthSessionResponse | null;
  isHydrated: boolean;
  setAuth: (payload: AuthLoginResponse) => void;
  clearAuth: () => void;
  login: (credentials: AuthCredentials) => Promise<AuthSessionResponse>;
  register: (payload: RegisterPayload) => Promise<AuthSessionResponse>;
  refreshTokens: () => Promise<string>;
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
      accessToken: null,
      expiresAt: null,
      session: null,
      isHydrated: false,
      setAuth: (payload) => {
        const expiresAt = Date.now() + payload.expiresIn * 1000;
        set({
          accessToken: payload.accessToken,
          expiresAt,
          session: payload.session,
          isHydrated: true,
        });
      },
      clearAuth: () => {
        set({
          accessToken: null,
          expiresAt: null,
          session: null,
        });
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
          get().setAuth(data);
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
          get().setAuth(data);
          return data.session;
        } catch (error: any) {
          const errorMessage = extractErrorMessage(error);
          throw new Error(errorMessage);
        }
      },
      refreshTokens: async () => {
        // This must only run in the browser, where cookies are available.
        if (typeof window === 'undefined') {
          console.log('[auth] refreshTokens() called on server, skipping');
          throw new Error('refreshTokens is a client-only method');
        }

        console.log('[auth] refreshTokens() called');
        try {
          const { data } = await authClient.post<AuthRefreshResponse>(
            '/auth/refresh',
            {} // refresh token is now supplied via HttpOnly cookie
          );
          console.log('[auth] refreshTokens() success', {
            hasAccessToken: !!data.accessToken,
            userId: data.session.user.id,
          });
          get().setAuth(data);
          return data.accessToken;
        } catch (error: any) {
          console.error(
            '[auth] refreshTokens() error',
            error?.response ?? error
          );
          throw error;
        }
      },
      logout: async () => {
        try {
          await apiClient.post('/auth/logout');
        } catch (error) {
          // Ignore network errors while logging out
        }
        set({
          accessToken: null,
          expiresAt: null,
          session: null,
        });
      },
      isAuthenticated: () => {
        const state = get();
        // User is considered authenticated if we have a valid session object.
        // Access token is kept in memory only and refreshed via HttpOnly cookie.
        return Boolean(state.session);
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        // Only persist session metadata; tokens stay in memory only.
        accessToken: null,
        expiresAt: null,
        session: state.session,
      }),
      onRehydrateStorage: () => {
        return (_state, error) => {
          const store = useAuthStoreBase.getState();
          if (error) {
            store.clearAuth();
            useAuthStoreBase.setState({ isHydrated: true });
          } else {
            useAuthStoreBase.setState({ isHydrated: true });
          }
        };
      },
    }
  )
);

export const useAuthStore = useAuthStoreBase;

let refreshPromise: Promise<string> | null = null;

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    console.log('[auth] request', config.url, 'attaching Authorization header');
    config.headers.set('Authorization', `Bearer ${token}`);
  } else {
    console.log('[auth] request', config.url, '- no accessToken in store');
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    if (!response || !config) {
      return Promise.reject(error);
    }

    const originalRequest = config as typeof config & { _retry?: boolean };

    if (response.status === 401 && !originalRequest._retry) {
      console.warn(
        '[auth] 401 from',
        config.url,
        '- attempting refresh via refreshTokens()'
      );
      if (!refreshPromise) {
        const store = useAuthStore.getState();
        refreshPromise = store
          .refreshTokens()
          .catch((refreshError: unknown) => {
            console.error('[auth] refreshTokens() threw', refreshError);
            refreshPromise = null;
            throw refreshError;
          });
      }

      try {
        const newAccessToken = await refreshPromise;
        refreshPromise = null;
        console.log(
          '[auth] refreshTokens() returned new access token?',
          !!newAccessToken
        );
        if (!newAccessToken) {
          // let caller handle unauthenticated state; do not clear auth here
          return Promise.reject(error);
        }
        originalRequest._retry = true;
        originalRequest.headers.set(
          'Authorization',
          `Bearer ${newAccessToken}`
        );
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('[auth] refresh failed, propagating error', refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
