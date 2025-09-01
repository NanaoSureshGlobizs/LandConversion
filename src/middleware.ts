import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken');
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === '/';
  
  // If the user is on the login page, check if they are already logged in.
  // If so, redirect them to the dashboard.
  if (isAuthPage) {
    if (accessToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // If not logged in, allow them to stay on the login page.
    return NextResponse.next();
  }

  // Protect all dashboard routes. If the user is not logged in,
  // redirect them to the login page.
  if (!accessToken && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/', request.url));
  }

  // If the user is logged in and trying to access a dashboard page,
  // allow them to proceed.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
