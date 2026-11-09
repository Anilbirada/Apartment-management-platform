# Palm Heights Enterprise SaaS: Quality Assurance Bug Report & Defect Log

**Document Reference**: QA-BUG-2026-V1  
**Execution Date**: November 9, 2026  
**Auditor**: Lead QA Architect & Automation Test Engineer  
**Resolution Rate**: 100% (5 / 5 Identified Defects Investigated, Resolved & Verified)  
**Open Defects**: 0 Critical (P0), 0 High (P1), 0 Medium (P2), 0 Low (P3)  

---

## 1. Defect Summary Dashboard

| Bug ID | Severity | Module | User Role | Status | Retest Result |
|---|---|---|---|---|---|
| **BUG-001** | **P1 - High** | Role Configuration & Build | All Roles | ✅ **RESOLVED** | Verified (`npm run build` 0 errors) |
| **BUG-002** | **P1 - High** | Resident Portal | RESIDENT | ✅ **RESOLVED** | Verified (HTTP 200 on `/resident/dashboard`) |
| **BUG-003** | **P1 - High** | Admin Portal | PLATFORM_ADMIN | ✅ **RESOLVED** | Verified (HTTP 200 on `/admin/dashboard`) |
| **BUG-004** | **P2 - Medium**| Local Business Upgrade | GUEST -> BUSINESS | ✅ **RESOLVED** | Verified (Pass in Test 4) |
| **BUG-005** | **P2 - Medium**| Mobile Drawer Navigation | All Roles | ✅ **RESOLVED** | Verified (Mobile Drawer Responsive Audit) |

---

## 2. Detailed Bug Log & Root Cause Analysis

### BUG-001: TypeScript Type Narrowing & Union Mismatch in Route Guard
- **Bug ID**: BUG-001
- **Severity**: P1 - High
- **Module**: `src/lib/roles.ts`, `src/components/layout/Navbar.tsx`
- **Environment**: Next.js Production Build
- **Preconditions**: Running `prisma generate && next build`
- **Steps to Reproduce**:
  1. Define `canAccessRoute` with early return `if (canonical === 'PLATFORM_ADMIN') return true;`.
  2. Subsequent line checks `if (pathname.startsWith('/admin')) return canonical === 'PLATFORM_ADMIN';`.
  3. Run production build.
- **Expected Result**: Build completes cleanly.
- **Actual Result**: TypeScript build failed with error: `Type error: This comparison appears to be unintentional because the types '"LOCAL_BUSINESS" | "RESIDENT" | "GUEST" | "SERVICE_PROVIDER" | "SOCIETY_MANAGEMENT"' and '"PLATFORM_ADMIN"' have no overlap.`
- **Root Cause**: TypeScript's control flow analysis narrowed `canonical` by removing `'PLATFORM_ADMIN'`. Subsequent equality checks against `'PLATFORM_ADMIN'` became unreachable dead code in the type system.
- **Fix Applied**: Updated `src/lib/roles.ts` to return `false` for `/admin` paths once non-admin is narrowed, and streamlined route guards.
- **Retest Result**: `npm run build` compiled 45/45 routes cleanly with zero TypeScript errors.

---

### BUG-002: Missing Resident Dashboard Route (`/resident/dashboard`)
- **Bug ID**: BUG-002
- **Severity**: P1 - High
- **Module**: Routing / Resident Experience
- **User Role**: RESIDENT
- **Environment**: Web Application
- **Preconditions**: Resident user authenticates via `/login`.
- **Steps to Reproduce**:
  1. Log in with resident credentials (`resident@palmheights.internal`).
  2. Edge middleware redirects user to `/resident/dashboard`.
  3. Server renders 404 Not Found.
- **Expected Result**: Resident lands on a rich, dedicated resident dashboard.
- **Actual Result**: 404 Not Found (route did not exist).
- **Root Cause**: Early development placed resident features on the homepage rather than the enterprise-standard `/resident/dashboard`.
- **Fix Applied**: Implemented `src/app/resident/dashboard/page.tsx` featuring community hero, Doorstep Services carousel with quick booking modal, active service requests tracker, community notices, and Domestic Helper requirements widget.
- **Retest Result**: All resident logins now land smoothly on `/resident/dashboard` with HTTP 200.

---

### BUG-003: Platform Admin Dashboard Route Mismatch (`/admin` vs `/admin/dashboard`)
- **Bug ID**: BUG-003
- **Severity**: P1 - High
- **Module**: Admin Overview & Middleware
- **User Role**: PLATFORM_ADMIN
- **Environment**: Web Application
- **Preconditions**: Admin user logs in.
- **Steps to Reproduce**:
  1. Middleware redirects `ADMIN` to `/admin/dashboard`.
  2. Next.js only had `/admin/page.tsx`, causing a 404 or redirect cycle.
- **Expected Result**: Admin lands directly on `/admin/dashboard`.
- **Actual Result**: 404 Not Found on `/admin/dashboard`.
- **Root Cause**: Section 2 of customer requirements mandates `/admin/dashboard` as the official dashboard route, but page was located at `/admin`.
- **Fix Applied**: Created `src/app/admin/dashboard/page.tsx` re-exporting the comprehensive `AdminOverviewPage`.
- **Retest Result**: Admin authentication now resolves directly to `/admin/dashboard` (HTTP 200).

---

### BUG-004: Missing Required Schema Fields During Business Profile Creation
- **Bug ID**: BUG-004
- **Severity**: P2 - Medium
- **Module**: Business Upgrade Workflow
- **User Role**: GUEST -> LOCAL_BUSINESS
- **Environment**: Database / API Handlers
- **Preconditions**: Guest submits upgrade application to Local Business.
- **Steps to Reproduce**:
  1. Admin approves application.
  2. Handler updates user role to `BUSINESS` and creates `LocalBusiness` record omitting `address` or `contactPhone`.
  3. Prisma throws `PrismaClientValidationError: Argument address is missing`.
- **Expected Result**: Business profile created smoothly.
- **Actual Result**: Database validation failure on missing required non-nullable fields.
- **Root Cause**: `LocalBusiness` schema specifies `address`, `contactPhone`, `contactEmail`, and `description` as required strings.
- **Fix Applied**: Updated upgrade handler and fixtures to populate full contact and address records from the upgrade application form.
- **Retest Result**: Upgrade and profile creation executed cleanly with 100% pass rate.

---

### BUG-005: Mobile Navigation Drawer Stale Role Token Checks
- **Bug ID**: BUG-005
- **Severity**: P2 - Medium
- **Module**: Mobile Navigation (`src/components/layout/Navbar.tsx`)
- **User Role**: SERVICE_PROVIDER, PLATFORM_ADMIN, SOCIETY_MANAGEMENT
- **Environment**: Mobile Browsers (< 1024px)
- **Preconditions**: User with canonical role `SERVICE_PROVIDER` opens mobile drawer.
- **Steps to Reproduce**:
  1. Open hamburger menu on mobile screen.
  2. Observe navigation links.
  3. Drawer evaluated `user.role === 'PROVIDER'` and failed to match `SERVICE_PROVIDER`.
- **Expected Result**: Drawer displays Provider Hub, My Services, Job Requests, Messages.
- **Actual Result**: Drawer defaulted to partial or empty menu items.
- **Root Cause**: Direct string comparisons against raw database tokens instead of normalized `canonicalRole`.
- **Fix Applied**: Updated `src/components/layout/Navbar.tsx` mobile drawer section to branch on `canonicalRole === 'SERVICE_PROVIDER'`, `canonicalRole === 'PLATFORM_ADMIN'`, etc.
- **Retest Result**: All 6 account types display their exact respective navigation links on mobile devices.
