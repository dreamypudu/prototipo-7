import { jwtVerify } from 'jose';

export const AUTH_COOKIE_NAME = 'compass_auth';
export const AUTH_JWT_ISSUER = process.env.AUTH_JWT_ISSUER || 'compass-auth';
export const AUTH_TOKEN_HOURS = Math.max(1, Number(process.env.AUTH_TOKEN_HOURS || '12'));

const secret = process.env.AUTH_JWT_SECRET;
const backendApiUrl = process.env.BACKEND_API_URL;

export const getBackendApiUrl = () => {
  if (!backendApiUrl) {
    throw new Error('BACKEND_API_URL is required.');
  }
  return backendApiUrl.replace(/\/$/, '');
};

const getSecretKey = () => {
  if (!secret) {
    throw new Error('AUTH_JWT_SECRET is required.');
  }
  return new TextEncoder().encode(secret);
};

export const parseCookieHeader = (headerValue?: string | null) => {
  const cookies: Record<string, string> = {};
  if (!headerValue) return cookies;

  for (const part of headerValue.split(';')) {
    const [rawKey, ...rawValue] = part.trim().split('=');
    if (!rawKey) continue;
    cookies[rawKey] = decodeURIComponent(rawValue.join('=') || '');
  }

  return cookies;
};

export const getTokenFromCookieHeader = (headerValue?: string | null) => {
  const cookies = parseCookieHeader(headerValue);
  return cookies[AUTH_COOKIE_NAME] || null;
};

export const verifySessionToken = async (token: string) => {
  const result = await jwtVerify(token, getSecretKey(), {
    issuer: AUTH_JWT_ISSUER,
  });
  return result.payload;
};

export const buildAuthCookie = (token: string) => {
  const maxAge = AUTH_TOKEN_HOURS * 60 * 60;
  return [
    `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Secure',
    `Max-Age=${maxAge}`,
  ].join('; ');
};

export const clearAuthCookie = () =>
  [
    `${AUTH_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Secure',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  ].join('; ');

export const buildBackendUrl = (path: string, search = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getBackendApiUrl()}${normalizedPath}${search}`;
};

export const jsonHeaders = (extra: Record<string, string> = {}) => ({
  'Content-Type': 'application/json',
  ...extra,
});
