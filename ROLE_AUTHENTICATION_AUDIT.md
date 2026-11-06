# ROLE-BASED AUTHENTICATION & DASHBOARD SYSTEM AUDIT
## Project: Palm Heights Enterprise Apartment Management & Marketplace SaaS
**Audit Date**: November 6, 2026  
**Author**: Principal Full-Stack Authentication Architect & Systems Engineer  
**Document**: `ROLE_AUTHENTICATION_AUDIT.md`

---

## 1. Executive Summary

This audit investigates the existing role-based authentication, dashboard routing, permission enforcement, and navigation subsystems. The objective is to identify all architectural root causes preventing users from reaching their designated role dashboards, ensure strict tenant isolation, and unify the six account types:
1. `GUEST`
2. `RESIDENT`
3. `SERVICE_PROVIDER`
4. `SOCIETY_MANAGEMENT`
5. `LOCAL_BUSINESS`
6. `PLATFORM_ADMIN`

---

## 2. Existing Authentication Flow & Architecture

1. **Identity & Storage Layer (`prisma/schema.prisma`)**:
   - `User` table holds central credentials: `id`, `email`, `phone`, `passwordHash`, `role`, `status`, `communityId`, `isVerified`.
   - Role-specific profile extensions: `ResidentProfile`, `ProviderProfile`, `LocalBusiness`, `Community` (managerId link).
   - Multi-role and upgrade applications: `RoleUpgradeApplication`, `ResidentApplication`.
2. **Session & Token Management (`src/lib/auth.ts`)**:
   - Stateless JWT tokens stored in HTTP-only cookies (`token`) and supported in `Authorization: Bearer <token>` headers.
   - 7-day expiration with HMAC-SHA256 signing using server secret.
   - Payload includes: `userId`, `email`, `phone`, `role`, `communityId`, `name`.
3. **Edge Middleware (`src/middleware.ts`)**:
   - Decodes JWT payload at the edge without database hit.
   - Intercepts unauthenticated visitors attempting restricted marketplace or portal access.
   - Redirects to `/login?redirect=...&message=...`.
   - Enforces preliminary route boundaries based on `user.role`.

---

## 3. Discovered Defects & Root Causes

### Defect 1: Missing `/resident/dashboard` Route
- **Impact**: When a resident authenticates, `login/page.tsx` redirected to `/` (the public landing page).
- **Root Cause**: The directory `src/app/resident/` did not exist. There was no dedicated resident dashboard page in the Next.js App Router tree.
- **Remediation**: Create `src/app/resident/dashboard/page.tsx` integrating all client-approved resident capabilities: community stats, booked service requests, helper requirements, neighborhood local businesses, active campaigns, and direct messaging.

### Defect 2: Missing `/admin/dashboard` Route
- **Impact**: While `src/middleware.ts` attempted to map `ADMIN` to `/admin/dashboard`, that route returned a 404 because only `src/app/admin/page.tsx` (`/admin`) was implemented.
- **Root Cause**: Route mismatch between middleware `/admin/dashboard` and existing route `/admin`.
- **Remediation**: Create `src/app/admin/dashboard/page.tsx` as the canonical admin dashboard and ensure `/admin` cleanly points/redirects to `/admin/dashboard`.

### Defect 3: Role Nomenclature Inconsistency
- **Impact**: Customer specification requests six official account types:
  `GUEST`, `RESIDENT`, `SERVICE_PROVIDER`, `SOCIETY_MANAGEMENT`, `LOCAL_BUSINESS`, `PLATFORM_ADMIN`.
  The existing database uses abbreviated tokens: `GUEST`, `RESIDENT`, `PROVIDER`, `MANAGEMENT`, `BUSINESS`, `ADMIN`.
- **Root Cause**: Lack of a centralized role translation and normalization layer.
- **Remediation**: Implement `src/lib/roles.ts` as the single source of truth for:
  - Canonical role aliases and normalization (`SERVICE_PROVIDER` ↔ `PROVIDER`, `SOCIETY_MANAGEMENT` ↔ `MANAGEMENT`, `LOCAL_BUSINESS` ↔ `BUSINESS`, `PLATFORM_ADMIN` ↔ `ADMIN`).
  - Role metadata, display labels, visual badges, and permission matrices.
  - Centralized dashboard mapping table.

### Defect 4: Post-Login Redirection Logic Lacked Account Status Verification
- **Impact**: Users with `PENDING` or `REJECTED` applications (e.g. self-registered residents awaiting management approval) were treated identically to fully approved members or silently misrouted.
- **Root Cause**: `routeUserAfterAuth` in `src/app/login/page.tsx` only inspected `user.role` without inspecting `user.status` or handling approval workflows.
- **Remediation**: Enhance post-login resolver to evaluate `status`:
  - If `user.status === 'PENDING'`, route to their status tracking view or show an informative approval banner.
  - Use centralized `getDashboardForRole(role)` for deterministic navigation.

### Defect 5: Incomplete Role-Specific Navigation Menus
- **Impact**: Header navigation in `Navbar.tsx` did not fully expose the specific navigation items specified in Section 13 for each of the 6 roles.
- **Root Cause**: Ad-hoc links rendered per role without centralized navigation configuration.
- **Remediation**: Define exact navigation configurations in `src/lib/roles.ts` and bind both desktop and mobile navbar layouts to this configuration.

### Defect 6: Tenant Isolation Gaps in Management APIs
- **Impact**: Society Management users could potentially query residents or data from communities other than their assigned `communityId`.
- **Root Cause**: Missing tenant ownership check in some community sub-routes.
- **Remediation**: Enforce strict apartment authorization: when a user has role `MANAGEMENT` / `SOCIETY_MANAGEMENT`, ensure `user.communityId === requestedCommunityId`; otherwise return 403 Forbidden.

---

## 4. Role-to-Dashboard Canonical Mapping

| Account Type (Customer Spec) | Database Token | Canonical Dashboard Route | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **GUEST** | `GUEST` | `/guest/dashboard` | Guest Profile, Upgrade Applications, Application Status Tracker |
| **RESIDENT** | `RESIDENT` | `/resident/dashboard` | Community Feed, Service Bookings, Helper Hiring, Messaging, Profile |
| **SERVICE_PROVIDER** | `PROVIDER` | `/provider/dashboard` | Active Jobs, Listing Management, Earnings, QR Gate Pass, Tier Status |
| **SOCIETY_MANAGEMENT** | `MANAGEMENT` | `/management/dashboard` | Resident Approvals, QR Gate Attendance, Security Logs, Apartment Config |
| **LOCAL_BUSINESS** | `BUSINESS` | `/business/dashboard` | Storefront Profile, Promotional Campaigns, Media Uploads, Membership |
| **PLATFORM_ADMIN** | `ADMIN` | `/admin/dashboard` | Platform Operations, Role Management, Approvals, Monetization, Tiers |

---

## 5. Architectural Implementation Plan

1. **Create `src/lib/roles.ts`**: Single source of truth for canonical roles, normalizers, dashboard routes, permissions, and navigation items.
2. **Implement `/resident/dashboard`**: Create full-featured, interactive Resident Dashboard in `src/app/resident/dashboard/page.tsx`.
3. **Implement `/admin/dashboard`**: Create canonical Admin Dashboard in `src/app/admin/dashboard/page.tsx`.
4. **Update `src/app/login/page.tsx` & Post-Login Service**: Standardize authentication flow, status checks, and redirection.
5. **Update `src/middleware.ts`**: Implement strict route protection and role boundaries using canonical mappings.
6. **Update `src/components/layout/Navbar.tsx`**: Render strict role-specific navigation menus matching Section 13.
7. **Protect APIs & Enforce Tenant Isolation**: Safeguard apartment and management endpoints with 403 Forbidden guards.
8. **Automated Testing Suite (`scripts/test-role-auth-system.js`)**: Verify all 15 scenarios specified in Section 16.
9. **Compile Production Build**: Validate with `npm run build`.
10. **Generate `ROLE_TEST_REPORT.md`**: Document verification results for all 6 account types.
