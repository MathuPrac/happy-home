import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiResponse } from '@restaurant/shared-types';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  getAccessToken?: () => string | null | undefined;
  getRefreshToken?: () => string | null | undefined;
  onRefreshToken?: (refreshToken: string) => Promise<string | null>;
  onUnauthorized?: () => void;
}

export interface ApiClient {
  instance: AxiosInstance;
  get: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
  delete: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
}

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

function unwrap<T>(response: AxiosResponse<ApiResponse<T>>): T {
  const body = response.data;
  if (!body.success || body.data === undefined) {
    const message = body.errors?.[0]?.message ?? body.message ?? 'Request failed';
    throw new Error(message);
  }
  return body.data;
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout ?? 10000,
    headers: { 'Content-Type': 'application/json' },
  });

  instance.interceptors.request.use((req: InternalAxiosRequestConfig) => {
    const token = config.getAccessToken?.();
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
  });

  instance.interceptors.response.use(
    (res: AxiosResponse) => res,
    async (error: AxiosError<ApiResponse<unknown>>) => {
      const original = error.config as RetryableConfig | undefined;
      if (
        error.response?.status === 401 &&
        original &&
        !original._retry &&
        config.getRefreshToken &&
        config.onRefreshToken
      ) {
        original._retry = true;
        const refresh = config.getRefreshToken();
        if (refresh) {
          const newToken = await config.onRefreshToken(refresh);
          if (newToken) {
            original.headers.Authorization = `Bearer ${newToken}`;
            const retry = await instance.request(original);
            return retry;
          }
        }
        config.onUnauthorized?.();
      }
      return Promise.reject(error);
    },
  );

  return {
    instance,
    get: async <T>(url: string, cfg?: AxiosRequestConfig) =>
      unwrap<T>(await instance.get<ApiResponse<T>>(url, cfg)),
    post: async <T>(url: string, data?: unknown, cfg?: AxiosRequestConfig) =>
      unwrap<T>(await instance.post<ApiResponse<T>>(url, data, cfg)),
    put: async <T>(url: string, data?: unknown, cfg?: AxiosRequestConfig) =>
      unwrap<T>(await instance.put<ApiResponse<T>>(url, data, cfg)),
    patch: async <T>(url: string, data?: unknown, cfg?: AxiosRequestConfig) =>
      unwrap<T>(await instance.patch<ApiResponse<T>>(url, data, cfg)),
    delete: async <T>(url: string, cfg?: AxiosRequestConfig) =>
      unwrap<T>(await instance.delete<ApiResponse<T>>(url, cfg)),
  };
}

export { axios };
export type { AxiosError, AxiosRequestConfig };
