export const API_BASE_URL = '/api/backend';

export const withApiBase = (path: string) => {
  const base = API_BASE_URL.replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
};
