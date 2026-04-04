import {
  buildBackendUrl,
  clearAuthCookie,
  getTokenFromCookieHeader,
  verifySessionToken,
} from '../_lib/auth.js';

const getProtectedBackendPath = (pathParts: string[]) => {
  const [scope, ...rest] = pathParts;
  if (scope === 'assets') {
    return `/protected-assets/${rest.join('/')}`;
  }
  if (scope === 'public') {
    return `/protected-public/${rest.join('/')}`;
  }
  return null;
};

export default async function handler(req: any, res: any) {
  const token = getTokenFromCookieHeader(req.headers.cookie);
  if (!token) {
    return res.status(401).send('missing_session');
  }

  try {
    await verifySessionToken(token);
  } catch {
    res.setHeader('Set-Cookie', clearAuthCookie());
    return res.status(401).send('invalid_session');
  }

  const pathParts = Array.isArray(req.query.path)
    ? req.query.path
    : typeof req.query.path === 'string'
      ? [req.query.path]
      : [];

  const protectedPath = getProtectedBackendPath(pathParts);
  if (!protectedPath) {
    return res.status(404).send('not_found');
  }

  try {
    const incomingUrl = new URL(req.url, 'http://local-proxy');
    const response = await fetch(buildBackendUrl(protectedPath, incomingUrl.search), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const body = Buffer.from(await response.arrayBuffer());
    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');

    const cacheControl = response.headers.get('cache-control');
    if (cacheControl) {
      res.setHeader('Cache-Control', cacheControl);
    }

    if (response.status === 401 || response.status === 403) {
      res.setHeader('Set-Cookie', clearAuthCookie());
    }

    return res.send(body);
  } catch (error) {
    console.error('[protected proxy] failed', error);
    return res.status(502).send('protected_proxy_failed');
  }
}
