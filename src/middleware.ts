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

function normalizeRole(role?: string | null): string {
  if (!role) return 'GUEST';
  const upper = role.toUpperCase().trim();
  if (upper === 'SERVICE_PROVIDER' || upper === 'PROVIDER') return 'PROVIDER';
  if (upper === 'SOCIETY_MANAGEMENT' || upper === 'MANAGEMENT') return 'MANAGEMENT';
  if (upper === 'LOCAL_BUSINESS' || upper === 'BUSINESS') return 'BUSINESS';
  if (upper === 'PLATFORM_ADMIN' || upper === 'ADMIN') return 'ADMIN';
  if (upper === 'RESIDENT') return 'RESIDENT';
  return 'GUEST';
}

const ROLE_DASHBOARDS: Record<string, string> = {
  GUEST: '/guest/dashboard',
  RESIDENT: '/resident/dashboard',
  PROVIDER: '/provider/dashboard',
  BUSINESS: '/business/dashboard',
  MANAGEMENT: '/management/dashboard',
  ADMIN: '/admin/dashboard'
};

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
  const role = normalizeRole(user?.role);
  const userDashboard = ROLE_DASHBOARDS[role] || '/guest/dashboard';

  // 1. Unauthenticated visitor attempting to access restricted marketplace or portal
  if (!user && (isMarketplaceRoute || isPortalRoute)) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname + (search || ''));
    loginUrl.searchParams.set(
      'message',
      'Please log in to explore services and local businesses in your community.'
    );
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated user visiting /login directly -> allow access so users can switch personas or sign into another account freely (trap prevention)

  // 3. Authenticated Role Boundary Enforcement
  if (user) {
    // Platform Admin has global oversight across all dashboards
    if (role === 'ADMIN') {
      return NextResponse.next();
    }

    // Prevent non-admin from accessing /admin routes -> redirect to login with prompt to access admin console
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname + (search || ''));
      loginUrl.searchParams.set(
        'message',
        'Platform Administrator credentials required to access Central SaaS Admin Console.'
      );
      return NextResponse.redirect(loginUrl);
    }

    // Prevent non-management from accessing /management routes
    if (pathname.startsWith('/management') && role !== 'MANAGEMENT') {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname + (search || ''));
      loginUrl.searchParams.set(
        'message',
        'Society Management credentials required to access Management Portal.'
      );
      return NextResponse.redirect(loginUrl);
    }

    // Prevent non-provider from accessing /provider routes
    if (pathname.startsWith('/provider') && role !== 'PROVIDER') {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname + (search || ''));
      loginUrl.searchParams.set(
        'message',
        'Service Provider credentials required to access Provider Hub.'
      );
      return NextResponse.redirect(loginUrl);
    }

    // Prevent non-business from accessing /business routes
    if (pathname.startsWith('/business') && role !== 'BUSINESS') {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname + (search || ''));
      loginUrl.searchParams.set(
        'message',
        'Local Business Merchant credentials required to access Business Hub.'
      );
      return NextResponse.redirect(loginUrl);
    }

    // Prevent non-resident from accessing /resident routes
    if (pathname.startsWith('/resident') && role !== 'RESIDENT') {
      return NextResponse.redirect(new URL(userDashboard, req.url));
    }

    // Prevent elevated roles from accessing guest portal (they have their own dashboard)
    if (pathname.startsWith('/guest') && role !== 'GUEST') {
      return NextResponse.redirect(new URL(userDashboard, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
