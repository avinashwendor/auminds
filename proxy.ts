import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from './lib/auth/jwt';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auminds_session')?.value;
  const session = token ? await verifySessionToken(token) : null;

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

  // Redirect logged-in users away from login page to appropriate dashboard
  if (pathname === '/login' && session) {
    if (session.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/login'],
};
