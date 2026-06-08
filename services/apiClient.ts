import { API_BASE_URL } from './apiConfig';

const AUTH_REFRESH_PATH = '/auth/refresh';
let refreshPromise: Promise<boolean> | null = null;

const toApiUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) return path;
  const base = API_BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

const isAuthRefreshablePath = (path: string) =>
  !path.startsWith('/auth/login') &&
  !path.startsWith('/auth/logout') &&
  !path.startsWith(AUTH_REFRESH_PATH);

export const refreshAuthSession = async (): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = fetch(toApiUrl(AUTH_REFRESH_PATH), {
      method: 'POST',
      credentials: 'include',
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

export const apiFetch = async (
  path: string,
  init: RequestInit = {},
  options: { retryOnUnauthorized?: boolean } = {}
): Promise<Response> => {
  const retryOnUnauthorized = options.retryOnUnauthorized ?? true;
  const requestInit: RequestInit = {
    ...init,
    credentials: 'include',
  };

  const response = await fetch(toApiUrl(path), requestInit);
  if (response.status !== 401 || !retryOnUnauthorized || !isAuthRefreshablePath(path)) {
    return response;
  }

  const refreshed = await refreshAuthSession();
  if (!refreshed) return response;
  return fetch(toApiUrl(path), requestInit);
};
