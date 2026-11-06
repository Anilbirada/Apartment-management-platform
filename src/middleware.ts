import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function parseJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    if (parsed.exp && parsed.exp * 1000 < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Static assets & APIs handled separately
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/icons')
  ) {
    return NextResponse.next();
  }

  // Public visitor allowed paths
  const publicPaths = ['/', '/login', '/register', '/about', '/contact'];
  const isExactPublicPath = publicPaths.includes(pathname);

  // Protected Marketplace and User Portal Routes
  const isMarketplaceRoute =
    pathname.startsWith('/services') ||
    pathname.startsWith('/providers') ||
    pathname.startsWith('/businesses');

  const isPortalRoute =
    pathname.startsWith('/guest') ||
    pathname.startsWith('/resident') ||
    pathname.startsWith('/provider') ||
    pathname.startsWith('/business') ||
    pathname.startsWith('/management') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/requests') ||
    pathname.startsWith('/requirements') ||
    pathname.startsWith('/messages');

  const token = req.cookies.get('token')?.value;
  const user = token ? parseJwtPayload(token) : null;

  // Unauthenticated user attempting to access restricted content
  if (!user && (isMarketplaceRoute || isPortalRoute)) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname + (search || ''));
    loginUrl.searchParams.set(
      'message',
      'Please log in to explore services and local businesses in your community.'
    );
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in, enforce Role-Based Navigation & Route Access (Requirement 14 & TEST 10)
  if (user) {
    const role = user.role?.toUpperCase();

    // Map each role to their authorized dashboard
    const roleHomeMap: Record<string, string> = {
      GUEST: '/guest/dashboard',
      RESIDENT: '/',
      PROVIDER: '/provider/dashboard',
      BUSINESS: '/business/dashboard',
      MANAGEMENT: '/management/dashboard',
      ADMIN: '/admin/dashboard'
    };

    // Prevent non-admin from accessing /admin routes
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      const dest = roleHomeMap[role] || '/';
      return NextResponse.redirect(new URL(dest, req.url));
    }

    // Prevent non-management from accessing /management routes (Admin allowed)
    if (pathname.startsWith('/management') && role !== 'MANAGEMENT' && role !== 'ADMIN') {
      const dest = roleHomeMap[role] || '/';
      return NextResponse.redirect(new URL(dest, req.url));
    }

    // Prevent non-provider from accessing /provider routes (Admin allowed)
    if (pathname.startsWith('/provider') && role !== 'PROVIDER' && role !== 'ADMIN') {
      const dest = roleHomeMap[role] || '/';
      return NextResponse.redirect(new URL(dest, req.url));
    }

    // Prevent non-business from accessing /business routes (Admin allowed)
    if (pathname.startsWith('/business') && role !== 'BUSINESS' && role !== 'ADMIN') {
      const dest = roleHomeMap[role] || '/';
      return NextResponse.redirect(new URL(dest, req.url));
    }

    // Prevent non-guest from accessing /guest routes (Admin allowed)
    if (pathname.startsWith('/guest') && role !== 'GUEST' && role !== 'ADMIN') {
      const dest = roleHomeMap[role] || '/';
      return NextResponse.redirect(new URL(dest, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
