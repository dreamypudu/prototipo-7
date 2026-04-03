import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookieHeader, verifySessionToken } from './api/_lib/auth';

const unauthorizedResponse = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/backend/')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (pathname.startsWith('/assets/')) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
};

export async function middleware(request: NextRequest) {
  const token = getTokenFromCookieHeader(request.headers.get('cookie'));
  if (!token) {
    return unauthorizedResponse(request);
  }

  try {
    await verifySessionToken(token);
    return NextResponse.next();
  } catch {
    return unauthorizedResponse(request);
  }
}

export const config = {
  matcher: ['/app', '/app/:path*', '/app.html', '/assets/:path*', '/api/backend/:path*'],
};
