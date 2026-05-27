import { createApiClient } from '@restaurant/api-client';

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
}

export const api = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
  getAccessToken,
  getRefreshToken,
  onRefreshToken: async () => {
    // TODO: wire refresh endpoint when auth flow is connected
    return null;
  },
  onUnauthorized: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },
});

/** @deprecated Use `api` from this module */
export const apiClient = api.instance;
