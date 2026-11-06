/**
 * Centralized Role Configuration & Authorization Engine
 * Project: Palm Heights Enterprise Apartment Management & Marketplace SaaS
 * 
 * Defines the six official account types, canonical mappings,
 * dashboard routes, permissions, and navigation structures.
 */

export type CanonicalRole =
  | 'GUEST'
  | 'RESIDENT'
  | 'SERVICE_PROVIDER'
  | 'SOCIETY_MANAGEMENT'
  | 'LOCAL_BUSINESS'
  | 'PLATFORM_ADMIN';

export type DbRole =
  | 'GUEST'
  | 'RESIDENT'
  | 'PROVIDER'
  | 'MANAGEMENT'
  | 'BUSINESS'
  | 'ADMIN';

export interface RoleMetadata {
  canonical: CanonicalRole;
  dbToken: DbRole;
  label: string;
  shortLabel: string;
  dashboardRoute: string;
  badgeClass: string;
  description: string;
}

export const ROLE_DEFINITIONS: Record<CanonicalRole, RoleMetadata> = {
  GUEST: {
    canonical: 'GUEST',
    dbToken: 'GUEST',
    label: 'Guest',
    shortLabel: 'Guest',
    dashboardRoute: '/guest/dashboard',
    badgeClass: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
    description: 'Public visitor with an active guest account. Can view public services and apply for membership upgrades.'
  },
  RESIDENT: {
    canonical: 'RESIDENT',
    dbToken: 'RESIDENT',
    label: 'Apartment Resident',
    shortLabel: 'Resident',
    dashboardRoute: '/resident/dashboard',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    description: 'Verified apartment resident with access to doorstep services, community hiring, messaging, and requests.'
  },
  SERVICE_PROVIDER: {
    canonical: 'SERVICE_PROVIDER',
    dbToken: 'PROVIDER',
    label: 'Service Provider',
    shortLabel: 'Provider',
    dashboardRoute: '/provider/dashboard',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    description: 'Verified professional service provider offering handyman, cleaning, and technical services to societies.'
  },
  SOCIETY_MANAGEMENT: {
    canonical: 'SOCIETY_MANAGEMENT',
    dbToken: 'MANAGEMENT',
    label: 'Society Management',
    shortLabel: 'Management',
    dashboardRoute: '/management/dashboard',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    description: 'Apartment estate office administrator responsible for resident approvals, gate passes, and society operations.'
  },
  LOCAL_BUSINESS: {
    canonical: 'LOCAL_BUSINESS',
    dbToken: 'BUSINESS',
    label: 'Local Business',
    shortLabel: 'Business',
    dashboardRoute: '/business/dashboard',
    badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300 dark:border-teal-800',
    description: 'Neighborhood commercial establishment promoting hyperlocal products and sponsored community campaigns.'
  },
  PLATFORM_ADMIN: {
    canonical: 'PLATFORM_ADMIN',
    dbToken: 'ADMIN',
    label: 'Platform Administrator',
    shortLabel: 'Admin',
    dashboardRoute: '/admin/dashboard',
    badgeClass: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    description: 'Master platform administrator with unrestricted oversight across all communities, roles, and monetization.'
  }
};

/**
 * Normalizes any role input (legacy token, lowercase, canonical) into a CanonicalRole.
 */
export function toCanonicalRole(role?: string | null): CanonicalRole {
  if (!role) return 'GUEST';
  const upper = role.toUpperCase().trim();
  switch (upper) {
    case 'GUEST':
      return 'GUEST';
    case 'RESIDENT':
      return 'RESIDENT';
    case 'SERVICE_PROVIDER':
    case 'PROVIDER':
      return 'SERVICE_PROVIDER';
    case 'SOCIETY_MANAGEMENT':
    case 'MANAGEMENT':
      return 'SOCIETY_MANAGEMENT';
    case 'LOCAL_BUSINESS':
    case 'BUSINESS':
      return 'LOCAL_BUSINESS';
    case 'PLATFORM_ADMIN':
    case 'ADMIN':
      return 'PLATFORM_ADMIN';
    default:
      return 'GUEST';
  }
}

/**
 * Translates any role input to the underlying Database Token.
 */
export function toDbRole(role?: string | null): DbRole {
  const canonical = toCanonicalRole(role);
  return ROLE_DEFINITIONS[canonical].dbToken;
}

/**
 * Determines whether two role representations match.
 */
export function isRoleMatch(roleA?: string | null, roleB?: string | null): boolean {
  return toCanonicalRole(roleA) === toCanonicalRole(roleB);
}

/**
 * Resolves the official dashboard route for any role.
 */
export function getDashboardForRole(role?: string | null): string {
  const canonical = toCanonicalRole(role);
  return ROLE_DEFINITIONS[canonical].dashboardRoute;
}

/**
 * Resolves the display label for any role.
 */
export function getRoleLabel(role?: string | null): string {
  const canonical = toCanonicalRole(role);
  return ROLE_DEFINITIONS[canonical].label;
}

/**
 * Resolves badge styling classes for any role.
 */
export function getRoleBadgeClass(role?: string | null): string {
  const canonical = toCanonicalRole(role);
  return ROLE_DEFINITIONS[canonical].badgeClass;
}

export interface NavItem {
  name: string;
  href: string;
  badge?: string;
  iconName?: string;
}

/**
 * Exact role-based navigation configurations as defined in Section 13.
 */
export const ROLE_NAVIGATION: Record<CanonicalRole, NavItem[]> = {
  GUEST: [
    { name: 'Dashboard', href: '/guest/dashboard' },
    { name: 'Upgrade Membership', href: '/guest/dashboard#upgrades' },
    { name: 'My Applications', href: '/guest/dashboard#applications' },
    { name: 'Notifications', href: '/guest/dashboard' },
    { name: 'Profile', href: '/guest/dashboard' }
  ],
  RESIDENT: [
    { name: 'Home', href: '/resident/dashboard' },
    { name: 'Services', href: '/services' },
    { name: 'Requests', href: '/requests' },
    { name: 'Messages', href: '/messages' },
    { name: 'Local Businesses', href: '/businesses' },
    { name: 'Requirements', href: '/requirements' },
    { name: 'Profile', href: '/resident/dashboard#profile' }
  ],
  SERVICE_PROVIDER: [
    { name: 'Dashboard', href: '/provider/dashboard' },
    { name: 'My Services', href: '/provider/post-service' },
    { name: 'Incoming Requests', href: '/requests' },
    { name: 'Jobs', href: '/provider/dashboard#jobs' },
    { name: 'Messages', href: '/messages' },
    { name: 'Membership', href: '/provider/dashboard#membership' },
    { name: 'Earnings', href: '/provider/dashboard#earnings' },
    { name: 'QR Visits', href: '/provider/dashboard#qr' },
    { name: 'Profile', href: '/provider/dashboard#profile' }
  ],
  SOCIETY_MANAGEMENT: [
    { name: 'Dashboard', href: '/management/dashboard' },
    { name: 'Apartments', href: '/management/dashboard#apartments' },
    { name: 'Residents', href: '/management/dashboard#residents' },
    { name: 'Approvals', href: '/management/dashboard#approvals' },
    { name: 'Providers', href: '/management/dashboard#providers' },
    { name: 'Requirements', href: '/management/dashboard#requirements' },
    { name: 'Provider Visits', href: '/management/dashboard#visits' },
    { name: 'QR Management', href: '/management/dashboard#qr' },
    { name: 'Campaigns', href: '/management/dashboard#campaigns' },
    { name: 'Reports', href: '/management/dashboard#reports' }
  ],
  LOCAL_BUSINESS: [
    { name: 'Dashboard', href: '/business/dashboard' },
    { name: 'Business Profile', href: '/business/dashboard#profile' },
    { name: 'Campaigns', href: '/business/dashboard#campaigns' },
    { name: 'Advertisements', href: '/business/dashboard#ads' },
    { name: 'Membership', href: '/business/dashboard#membership' },
    { name: 'Analytics', href: '/business/dashboard#analytics' },
    { name: 'Payments', href: '/business/dashboard#payments' },
    { name: 'Profile', href: '/business/dashboard#profile' }
  ],
  PLATFORM_ADMIN: [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Apartments', href: '/admin/apartments' },
    { name: 'Users', href: '/admin/roles' },
    { name: 'Role Management', href: '/admin/roles' },
    { name: 'Applications', href: '/admin/upgrades' },
    { name: 'Providers', href: '/admin/memberships?entityType=PROVIDER' },
    { name: 'Businesses', href: '/admin/memberships?entityType=BUSINESS' },
    { name: 'Categories', href: '/admin/dashboard#categories' },
    { name: 'Campaigns', href: '/admin/approvals' },
    { name: 'Subscriptions', href: '/admin/monetization' },
    { name: 'Monetization', href: '/admin/monetization' },
    { name: 'QR Monitoring', href: '/admin/dashboard#qr' },
    { name: 'Reports', href: '/admin/dashboard#reports' },
    { name: 'Settings', href: '/admin/dashboard#settings' }
  ]
};

/**
 * Route protection checks.
 */
export function canAccessRoute(userRole?: string | null, pathname?: string): boolean {
  if (!pathname) return true;
  const canonical = toCanonicalRole(userRole);

  // Platform Admin has global oversight
  if (canonical === 'PLATFORM_ADMIN') return true;

  // Admin routes - only PLATFORM_ADMIN (already returned true above)
  if (pathname.startsWith('/admin')) {
    return false;
  }

  // Management routes
  if (pathname.startsWith('/management')) {
    return canonical === 'SOCIETY_MANAGEMENT';
  }

  // Provider routes
  if (pathname.startsWith('/provider')) {
    return canonical === 'SERVICE_PROVIDER';
  }

  // Business routes
  if (pathname.startsWith('/business')) {
    return canonical === 'LOCAL_BUSINESS';
  }

  // Resident routes
  if (pathname.startsWith('/resident')) {
    return canonical === 'RESIDENT';
  }

  // Guest routes
  if (pathname.startsWith('/guest')) {
    return canonical === 'GUEST';
  }

  return true;
}
