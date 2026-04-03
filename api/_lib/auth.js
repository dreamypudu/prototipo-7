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

export const parseCookieHeader = (headerValue) => {
  const cookies = {};
  if (!headerValue) return cookies;

  for (const part of headerValue.split(';')) {
    const [rawKey, ...rawValue] = part.trim().split('=');
    if (!rawKey) continue;
    cookies[rawKey] = decodeURIComponent(rawValue.join('=') || '');
  }

  return cookies;
};

export const getTokenFromCookieHeader = (headerValue) => {
  const cookies = parseCookieHeader(headerValue);
  return cookies[AUTH_COOKIE_NAME] || null;
};

export const verifySessionToken = async (token) => {
  const result = await jwtVerify(token, getSecretKey(), {
    issuer: AUTH_JWT_ISSUER,
  });
  return result.payload;
};

export const buildAuthCookie = (token) => {
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

export const buildBackendUrl = (path, search = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getBackendApiUrl()}${normalizedPath}${search}`;
};

export const jsonHeaders = (extra = {}) => ({
  'Content-Type': 'application/json',
  ...extra,
});
