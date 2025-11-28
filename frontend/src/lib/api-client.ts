import axios from 'axios';

const baseUrl =
  (import.meta.env.VITE_BACKEND_URL as string | undefined)?.replace(
    /\/$/,
    ''
  ) ?? 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: `${baseUrl}/api/v1`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authClient = axios.create({
  baseURL: `${baseUrl}/api/v1`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
