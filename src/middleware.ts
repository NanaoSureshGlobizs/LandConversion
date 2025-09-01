import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken');
  const { pathname } = request.nextUrl;

  const isDashboardPath = pathname.startsWith('/dashboard');
  const isLoginPath = pathname === '/';

  // If trying to access a dashboard route without a token, redirect to login
  if (isDashboardPath && !accessToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If already logged in (has token) and trying to access the login page, redirect to dashboard
  if (isLoginPath && accessToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except for API routes, Next.js internal routes, and static files.
  matcher: [
    '/',
    '/dashboard/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ],
};
