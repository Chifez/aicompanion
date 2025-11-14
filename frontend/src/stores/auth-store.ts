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
  refreshToken: string | null;
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

const useAuthStoreBase = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      session: null,
      isHydrated: false,
      setAuth: (payload) => {
        const expiresAt = Date.now() + payload.expiresIn * 1000;
        set({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          expiresAt,
          session: payload.session,
          isHydrated: true,
        });
      },
      clearAuth: () => {
        set({
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          session: null,
        });
      },
      login: async ({ email, password }) => {
        assertPassword(password);
        const { data } = await authClient.post<AuthLoginResponse>(
          '/auth/login',
          {
            email,
            password,
          }
        );
        get().setAuth(data);
        return data.session;
      },
      register: async ({ name, email, password }) => {
        assertPassword(password);
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
      },
      refreshTokens: async () => {
        const state = get();
        if (!state.refreshToken) {
          throw new Error('Missing refresh token');
        }
        const { data } = await authClient.post<AuthRefreshResponse>(
          '/auth/refresh',
          {
            refreshToken: state.refreshToken,
          }
        );
        get().setAuth(data);
        return data.accessToken;
      },
      logout: async () => {
        try {
          await apiClient.post('/auth/logout');
        } catch (error) {
          // Ignore network errors while logging out
        }
        set({
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          session: null,
        });
      },
      isAuthenticated: () => {
        const state = get();
        return Boolean(state.accessToken);
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        session: state.session,
      }),
      onRehydrateStorage: () => {
        return (_, error) => {
          if (error) {
            set({
              accessToken: null,
              refreshToken: null,
              expiresAt: null,
              session: null,
              isHydrated: true,
            });
          } else {
            set({ isHydrated: true });
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
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
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
      const store = useAuthStore.getState();
      if (!store.refreshToken) {
        store.clearAuth();
        return Promise.reject(error);
      }

      if (!refreshPromise) {
        refreshPromise = store.refreshTokens().catch((refreshError) => {
          refreshPromise = null;
          throw refreshError;
        });
      }

      try {
        const newAccessToken = await refreshPromise;
        refreshPromise = null;
        if (!newAccessToken) {
          throw new Error('Unable to refresh session');
        }
        originalRequest._retry = true;
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
        };
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      }
    }

    if (response.status === 401) {
      useAuthStore.getState().clearAuth();
    }

    return Promise.reject(error);
  }
);
