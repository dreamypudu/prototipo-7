import {
  buildBackendUrl,
  clearAuthCookie,
  getTokenFromCookieHeader,
} from '../_lib/auth.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const token = getTokenFromCookieHeader(req.headers.cookie);

  if (token) {
    try {
      await fetch(buildBackendUrl('/auth/logout'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.warn('[auth/logout] backend logout failed', error);
    }
  }

  res.setHeader('Set-Cookie', clearAuthCookie());
  return res.status(200).json({ ok: true });
}
