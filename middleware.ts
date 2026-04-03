import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'compass_auth';

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
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return unauthorizedResponse(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app', '/app/:path*', '/app.html', '/assets/:path*', '/api/backend/:path*'],
};
