import {
  buildBackendUrl,
  clearAuthCookie,
  getTokenFromCookieHeader,
  verifySessionToken,
} from '../../_lib/auth.js';

const getPathParts = (value: string[] | string | undefined) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return [value];
  return [];
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

  const pathParts = getPathParts(req.query.path);
  if (pathParts.length === 0) {
    return res.status(404).send('not_found');
  }

  try {
    const incomingUrl = new URL(req.url, 'http://local-proxy');
    const response = await fetch(
      buildBackendUrl(`/protected-assets/${pathParts.join('/')}`, incomingUrl.search),
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

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
    console.error('[protected/assets proxy] failed', error);
    return res.status(502).send('protected_proxy_failed');
  }
}
