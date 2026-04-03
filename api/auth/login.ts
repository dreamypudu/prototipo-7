import {
  buildAuthCookie,
  buildBackendUrl,
  clearAuthCookie,
  jsonHeaders,
} from '../_lib/auth';

const parseBody = (body: any) => {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
};

const parseResponseText = (value: string) => {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch {
    return { error: value };
  }
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  try {
    const payload = parseBody(req.body);
    const response = await fetch(buildBackendUrl('/auth/login'), {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({
        username: String(payload.username || ''),
        password: String(payload.password || ''),
      }),
    });

    const rawText = await response.text();
    const data = parseResponseText(rawText);

    if (!response.ok) {
      res.setHeader('Set-Cookie', clearAuthCookie());
      return res.status(response.status).json({
        error: data.detail || data.error || 'invalid_credentials',
      });
    }

    res.setHeader('Set-Cookie', buildAuthCookie(data.token));
    return res.status(200).json({
      ok: true,
      user: data.user,
    });
  } catch (error) {
    console.error('[auth/login] failed', error);
    res.setHeader('Set-Cookie', clearAuthCookie());
    return res.status(500).json({ error: 'auth_service_unavailable' });
  }
}
