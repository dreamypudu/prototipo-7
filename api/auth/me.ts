import {
  buildBackendUrl,
  clearAuthCookie,
  getTokenFromCookieHeader,
  verifySessionToken,
} from '../_lib/auth';

const parseResponseText = (value: string) => {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch {
    return { error: value };
  }
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

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

  try {
    const response = await fetch(buildBackendUrl('/auth/verify'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const rawText = await response.text();
    const data = parseResponseText(rawText);

    if (!response.ok) {
      res.setHeader('Set-Cookie', clearAuthCookie());
      return res.status(response.status).json({
        error: data.detail || data.error || 'invalid_session',
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('[auth/me] failed', error);
    return res.status(500).json({ error: 'auth_service_unavailable' });
  }
}
