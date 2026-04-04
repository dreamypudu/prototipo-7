import {
  buildBackendUrl,
  clearAuthCookie,
  getTokenFromCookieHeader,
  verifySessionToken,
} from './_lib/auth.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('method_not_allowed');
  }

  const token = getTokenFromCookieHeader(req.headers.cookie);
  if (!token) {
    return res.redirect(302, '/login');
  }

  try {
    await verifySessionToken(token);
  } catch {
    res.setHeader('Set-Cookie', clearAuthCookie());
    return res.redirect(302, '/login');
  }

  try {
    const response = await fetch(buildBackendUrl('/protected-app'), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const html = await response.text();
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        res.setHeader('Set-Cookie', clearAuthCookie());
        return res.redirect(302, '/login');
      }
      return res.status(response.status).send(html || 'protected_app_unavailable');
    }

    res.setHeader('Content-Type', response.headers.get('content-type') || 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', response.headers.get('cache-control') || 'private, no-store');
    return res.status(200).send(html);
  } catch (error) {
    console.error('[simulator] failed', error);
    return res.status(502).send('protected_app_unavailable');
  }
}
