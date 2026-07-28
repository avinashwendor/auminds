import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from './lib/auth/jwt';

const PUBLIC_AUTH_ROUTES = ['/login', '/signup'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  // A session that is no longer approved (pending, rejected or suspended) is
  // dropped immediately so the account cannot linger inside the app shell.
  if (session && session.status !== 'approved') {
    const target = PUBLIC_AUTH_ROUTES.includes(pathname)
      ? new URL(pathname, request.url)
      : new URL(`/pending-approval?status=${session.status}`, request.url);
    const response = NextResponse.redirect(target);
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  // Protect Admin Portal
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login?callbackUrl=' + encodeURIComponent(pathname), request.url));
    }
    if (session.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect Student Dashboard
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login?callbackUrl=' + encodeURIComponent(pathname), request.url));
    }
  }

  // Redirect signed-in users away from the login/signup pages
  if (PUBLIC_AUTH_ROUTES.includes(pathname) && session) {
    return NextResponse.redirect(new URL(session.role === 'admin' ? '/admin' : '/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/login', '/signup'],
};
