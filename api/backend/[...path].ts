import {
  buildBackendUrl,
  clearAuthCookie,
  getTokenFromCookieHeader,
  verifySessionToken,
} from '../_lib/auth.js';

const methodAllowsBody = (method?: string) => !['GET', 'HEAD'].includes(String(method || 'GET').toUpperCase());

const getRequestBody = (req: any) => {
  if (!methodAllowsBody(req.method)) return undefined;
  if (req.body == null) return undefined;
  if (typeof req.body === 'string') return req.body;
  return JSON.stringify(req.body);
};

export default async function handler(req: any, res: any) {
  const token = getTokenFromCookieHeader(req.headers.cookie);
  if (!token) {
    return res.status(401).json({ error: 'missing_session' });
  }

  try {
    await verifySessionToken(token);
  } catch {
    res.setHeader('Set-Cookie', clearAuthCookie());
    return res.status(401).json({ error: 'invalid_session' });
  }

  const pathParts = Array.isArray(req.query.path)
    ? req.query.path
    : typeof req.query.path === 'string'
      ? [req.query.path]
      : [];

  if (pathParts.length === 0) {
    return res.status(400).json({ error: 'missing_backend_path' });
  }

  try {
    const incomingUrl = new URL(req.url, 'http://local-proxy');
    const backendUrl = buildBackendUrl(`/${pathParts.join('/')}`, incomingUrl.search);
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(req.headers['content-type'] ? { 'Content-Type': req.headers['content-type'] } : {}),
      },
      body: getRequestBody(req),
    });

    const responseText = await response.text();
    const contentType = response.headers.get('content-type') || 'application/json; charset=utf-8';

    res.status(response.status);
    res.setHeader('Content-Type', contentType);

    if (response.status === 401 || response.status === 403) {
      res.setHeader('Set-Cookie', clearAuthCookie());
    }

    return res.send(responseText);
  } catch (error) {
    console.error('[api/backend proxy] failed', error);
    return res.status(502).json({ error: 'backend_proxy_failed' });
  }
}
