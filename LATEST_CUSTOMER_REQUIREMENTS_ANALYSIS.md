# LATEST CUSTOMER REQUIREMENTS ANALYSIS
## Enterprise Apartment Management & Local Services Marketplace SaaS
### Comprehensive Full-Stack Architecture & Integration Plan

**Document Version**: 3.0.0  
**Author**: Principal Full-Stack AI Engineer & Senior Software Architect  
**Date**: November 6, 2026  
**Status**: Architecture Approved & Implementation Ready

---

## 1. Executive Summary & Context

The customer has reviewed the commercial SaaS application and provided four pivotal enterprise requirements to graduate the platform into a production-hardened commercial release:

1. **Requirement 11: Guest Authentication and Marketplace Access Control**
   - Three distinct access states: Public Visitor, Authenticated Guest, and Approved Member.
   - Enforce authentication before allowing visitors to browse the service catalog, provider directory, local businesses, and targeted advertising campaigns.
   - Redirect unauthenticated access attempts to `/login?redirect=...` with a friendly explanatory message.
   - Support `GUEST` user accounts with their own guest dashboard (`/guest/dashboard`) and upgrade facilities.

2. **Requirement 12: Gold, Silver, and Bronze Membership Tiers**
   - Both Service Providers and Local Businesses must have a tier classification: **GOLD**, **SILVER**, or **BRONZE**.
   - These tiers dictate profile visibility and ranking priority on the backend: **Gold > Silver > Bronze**.
   - Secondary factors within each tier: rating, completed jobs, verification status, service area proximity.
   - Distinct, visible badges throughout cards and profiles.
   - Platform Admin tier management interface: assign/change tiers, configure validity periods, suspend, and view tier assignment history.
   - **Critical Rule**: Tier assignment is separate from subscription payment status (configurable decoupling).

3. **Requirement 13: Guest Membership Upgrade System**
   - Registered Guests can apply to upgrade their accounts to:
     - **Option 1**: Service Provider
     - **Option 2**: Local Business
     - **Option 3**: Society Management
   - Dedicated Guest Dashboard with 3 upgrade application wizards and document uploads.
   - Dedicated Platform Admin Role Upgrade Approval System with tabbed reviews, document inspection, one-click approval, rejection with mandatory reasons, and role/tier assignment.
   - Society Management upgrade strictly requires Platform Admin review and specific apartment authorization.

4. **Requirement 14: Role-Based UI and Navigation Correction**
   - **Critical Security Correction**: Remove the unrestricted global role switcher dropdown from the top navigation bar for ordinary users.
   - Normal users must **never** see unauthorized roles or have the ability to switch themselves into unauthorized roles.
   - Replace with a compact authenticated-role indicator showing the user's actual current role.
   - Provide role-specific navigation menus tailored strictly to permissions:
     - `GUEST`: Guest Dashboard, Upgrade Account, Profile.
     - `RESIDENT`: Home, Services, Requests, Messages, Profile.
     - `PROVIDER`: Provider Hub, My Services, Incoming Requests, Jobs, Messages, Profile.
     - `BUSINESS`: Business Hub, Campaigns, Advertising, Membership, Reports, Profile.
     - `MANAGEMENT`: Society Portal, Residents, Providers, Requirements, Gate Visits, Reports, Profile.
     - `ADMIN`: Centralized Master Navigation (Dashboard, Apartments, Users, Roles, Approvals, Upgrades, Memberships, Monetization, etc.).

---

## 2. Existing System Inspection & Gap Analysis

| Existing Module | Current Status | Integration & Required Modifications |
| :--- | :--- | :--- |
| **User Role Schema** | Roles: `RESIDENT`, `PROVIDER`, `MANAGEMENT`, `BUSINESS`, `ADMIN` | Add `GUEST` to supported roles in `User` model. Add `RoleUpgradeApplication` and `MembershipTierAudit` models. |
| **Top Navigation** | Contains demo role switcher that lets any user click between all 5 roles | **Remove switcher for non-admins**. Show read-only role badge. Move multi-role switching/simulation strictly to Admin Console. |
| **Marketplace Access** | Public `/services` allows anonymous visitors to search providers | Require authentication for browsing services & businesses. Redirect unauthenticated visitors to `/login?redirect=...`. |
| **Guest Onboarding** | Registration default is Resident | Add explicit Guest registration option. On register, assign `GUEST` role and redirect to `/guest/dashboard`. |
| **Provider & Business Tiers**| No tier badges; unranked sort | Add `tier` (`GOLD`, `SILVER`, `BRONZE`), `tierStatus`, `tierExpiryDate` to `ProviderProfile` & `LocalBusiness`. Sort by tier on backend. |
| **Upgrade Workflow** | Fragmented direct registration | Build centralized Guest Upgrade wizard (3 options) & Admin Upgrade Review queue. |
| **Admin Tools** | Admin has approvals for listings & providers | Add dedicated **Role Upgrades** and **Tier Management** tabs/pages in Admin Console. |

---

## 3. Database Schema Migration Plan

Safe additive schema expansion without dropping tables or altering existing data:

```prisma
// Extend ProviderProfile
model ProviderProfile {
  // Existing fields...
  tier                 String                 @default("BRONZE") // GOLD, SILVER, BRONZE
  tierStatus           String                 @default("ACTIVE") // ACTIVE, SUSPENDED
  tierEffectiveDate    DateTime               @default(now())
  tierExpiryDate       DateTime?
  tierAssignedById     String?
  tierAudits           MembershipTierAudit[]  @relation("ProviderTierAudits")
}

// Extend LocalBusiness
model LocalBusiness {
  // Existing fields...
  tier                 String                 @default("BRONZE") // GOLD, SILVER, BRONZE
  tierStatus           String                 @default("ACTIVE") // ACTIVE, SUSPENDED
  tierEffectiveDate    DateTime               @default(now())
  tierExpiryDate       DateTime?
  tierAssignedById     String?
  tierAudits           MembershipTierAudit[]  @relation("BusinessTierAudits")
}

// New Model: RoleUpgradeApplication
model RoleUpgradeApplication {
  id                   String                 @id @default(uuid())
  userId               String
  targetRole           String                 // PROVIDER, BUSINESS, MANAGEMENT
  status               String                 @default("PENDING_REVIEW") // DRAFT, SUBMITTED, PENDING_REVIEW, ADDITIONAL_INFO_REQUIRED, APPROVED, REJECTED, CANCELLED
  applicationDataJson  String                 // Comprehensive serialized form payload
  documentsJson        String?                // Array of uploaded document URLs
  rejectionReason      String?
  adminNotes           String?
  assignedCommunityId  String?
  assignedTier         String?                // GOLD, SILVER, BRONZE
  reviewedById         String?
  reviewedAt           DateTime?
  createdAt            DateTime               @default(now())
  updatedAt            DateTime               @updatedAt

  user                 User                   @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// New Model: MembershipTierAudit
model MembershipTierAudit {
  id                   String                 @id @default(uuid())
  entityType           String                 // PROVIDER, LOCAL_BUSINESS
  providerProfileId    String?
  localBusinessId      String?
  previousTier         String?
  newTier              String                 // GOLD, SILVER, BRONZE
  status               String                 @default("ACTIVE")
  effectiveDate        DateTime               @default(now())
  expiryDate           DateTime?
  reason               String?
  assignedById         String?
  createdAt            DateTime               @default(now())

  providerProfile      ProviderProfile?       @relation("ProviderTierAudits", fields: [providerProfileId], references: [id], onDelete: Cascade)
  localBusiness        LocalBusiness?         @relation("BusinessTierAudits", fields: [localBusinessId], references: [id], onDelete: Cascade)
}
```

---

## 4. API & Backend Security Architecture

1. **Marketplace Access Guard**:
   - `GET /api/v1/services` and `GET /api/v1/providers`: Validate JWT cookie/header. If unauthenticated, return `401 Unauthorized` with `{ error: 'AUTHENTICATION_REQUIRED', message: 'Please log in to explore services and local businesses in your community.' }`.
   - `GET /api/v1/businesses`: Validate authentication for directory listing.
   - Public homepage `/` fetches summary statistics or public highlights without exposing sensitive records.

2. **Tier Ranking Priority**:
   - Update `GET /api/v1/providers`:
     Sort providers by tier rank weight:
     - `GOLD` $\rightarrow$ Weight 3
     - `SILVER` $\rightarrow$ Weight 2
     - `BRONZE` $\rightarrow$ Weight 1
     - Secondary sort: `rating DESC`, `completedJobsCount DESC`, `createdAt DESC`.
   - Update `GET /api/v1/businesses`:
     Sort businesses with Gold first, Silver second, Bronze third.

3. **Guest Upgrade APIs**:
   - `POST /api/v1/guest/upgrade`: Authenticated guest submits application for `PROVIDER`, `BUSINESS`, or `MANAGEMENT`.
   - `GET /api/v1/guest/applications`: Returns current user's submitted upgrade applications and status.
   - `GET /api/v1/admin/upgrades`: Admin queries pending/approved/rejected applications.
   - `PATCH /api/v1/admin/upgrades/[id]`: Admin approves or rejects with reason; upon approval, updates `User.role`, creates/activates profile, and assigns tier.

4. **Tier Management APIs**:
   - `GET /api/v1/admin/memberships`: Lists providers and businesses with tiers, validity, and status.
   - `PATCH /api/v1/admin/memberships`: Updates tier, status, validity, and writes `MembershipTierAudit`.

---

## 5. Frontend UI/UX Plan

1. **Guest Dashboard (`/guest/dashboard`)**:
   - Clean, modern dashboard welcoming the authenticated guest.
   - Account overview card.
   - Application status tracker showing active/past upgrade submissions.
   - 3 upgrade option cards with modal application forms:
     - *Card 1*: Become a Service Provider
     - *Card 2*: Register as a Local Business
     - *Card 3*: Become Society Management
2. **Navigation Overhaul (`Navbar.tsx`)**:
   - Strip unrestricted role switcher for non-admins.
   - Render authenticated role badge (`Role: Guest`, `Role: Apartment Resident`, etc.).
   - Distinct navigation links mapped strictly to `user.role`.
   - For public visitors, keep visible **Sign In** and **Sign Up** buttons.
3. **Gold, Silver, Bronze Badges**:
   - Premium metallic gradient chips with Lucide icons (Crown for Gold, Medal for Silver, Shield for Bronze).
   - Rendered on provider cards, business cards, profile headers, and admin data tables.
4. **Admin Upgrade & Membership Management**:
   - Integrated into Platform Admin with tabs for Role Upgrades and Membership Tiers.

---

## 6. Verification & Test Plan

1. **Public Visitor**: Navigates to `/services` without login $\rightarrow$ redirected to `/login?redirect=/services` with notice.
2. **Guest Account**: Registers as Guest $\rightarrow$ routed to `/guest/dashboard`.
3. **Provider Upgrade**: Guest applies for Provider $\rightarrow$ status `PENDING_REVIEW` $\rightarrow$ Admin approves $\rightarrow$ role becomes `PROVIDER`.
4. **Business Upgrade**: Guest applies for Business $\rightarrow$ Admin approves $\rightarrow$ role becomes `BUSINESS`.
5. **Society Management Upgrade**: Guest applies for Society Management $\rightarrow$ Admin authorizes specific apartment $\rightarrow$ role becomes `MANAGEMENT`.
6. **Tier Ranking**: Admin assigns Gold to Provider B and Bronze to Provider A $\rightarrow$ Provider B ranked higher in search.
7. **Business Tier Ranking**: Gold businesses appear before Silver and Bronze.
8. **Role UI Isolation**: Log in as Resident $\rightarrow$ only Resident links visible; zero provider/admin options.
9. **Admin Control**: Admin has full role management, viewing, and simulation capability.
10. **Backend Security**: Direct API payload manipulation to escalate role is rejected with 403 Forbidden.
