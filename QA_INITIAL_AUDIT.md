# Palm Heights Enterprise SaaS: Quality Assurance Initial Audit

**Audit Date**: November 6, 2026  
**Auditor**: Senior QA Architect & Lead Full-Stack Test Engineer  
**Platform Version**: Palm Heights Enterprise 3.0  
**Environment**: Local QA Environment (Node.js 20, Next.js 14.2.35, Prisma ORM, SQLite DB)  

---

## 1. Current Application Architecture

| Layer | Technology | Description |
|---|---|---|
| **Frontend Framework** | Next.js 14.2.35 (App Router) | React 18.3, TypeScript 5.6, Tailwind CSS 3.4, Lucide Icons, Framer Motion, Recharts |
| **Backend Framework** | Next.js Server Components & Route Handlers | Node.js Runtime, REST API (`/api/v1/*`), Next.js Edge Middleware (`src/middleware.ts`) |
| **Database & ORM** | Prisma ORM 5.22.0 + SQLite (`prisma/dev.db`) | 27 models, relational foreign keys, cascade deletes, unique indices |
| **Authentication System** | JWT in HTTP-Only Cookies + Bearer Header | HMAC-SHA256 token verification, 7-day expiration, bcrypt password hashing (10 salt rounds) |
| **Edge Route Guard** | `src/middleware.ts` + `src/lib/roles.ts` | Persona boundary enforcement, automatic redirect to approved dashboards |
| **QR Gate Attendance** | HMAC-SHA256 Tokenization (`src/lib/qrCrypto.ts`) | Time-bounded rotating signatures, visit duration tracking, gate entry/exit logging |
| **File Storage** | Local Persistent Storage (`public/uploads`) | Dedicated upload endpoint (`/api/v1/uploads`), MIME type & size validation |
| **Subscription / Monetization** | Plan Entitlements & Transaction Ledger | Free & paid subscription tiers (Gold, Silver, Bronze), transaction idempotency |
| **Internationalization** | `src/lib/i18n.ts` | Multi-language localization (English, Hindi, Kannada) |

---

## 2. Existing Completed Modules

1. **Public Website & Marketplace Access Control**
   - Public Landing Page (`/`): Community showcases, business highlights, category exploration, how it works, testimonials, contact footer.
   - Marketplace Guard: Unauthenticated visitors trying to browse providers/businesses are redirected to `/login` with explanatory toast/message.
2. **Centralized User Identity & Role Engine**
   - 6 official personas: `GUEST`, `RESIDENT`, `SERVICE_PROVIDER`, `SOCIETY_MANAGEMENT`, `LOCAL_BUSINESS`, `PLATFORM_ADMIN`.
   - Canonical role normalizer (`src/lib/roles.ts`) and role-based navigation menus.
3. **Six Dedicated Dashboards**
   - Guest Portal (`/guest/dashboard`): Profile overview, upgrade membership applications, application tracker.
   - Resident Portal (`/resident/dashboard`): Community header, unit details, service booking carousel, active requests, helper hiring widget.
   - Provider Hub (`/provider/dashboard`): Tier badge, job requests, incoming leads, service listings, availability toggles.
   - Society Management Portal (`/management/dashboard`): Resident directory, approval queue, daily gate visits, community reports.
   - Local Business Hub (`/business/dashboard`): Business metrics, active advertising campaigns, ad performance charts, campaign launcher.
   - Platform Admin Dashboard (`/admin/dashboard`): Platform KPIs, community management, upgrade approvals, membership tier administration, monetization ledger.
4. **Guest Upgrade Workflows**
   - Guest to Provider, Guest to Business, Guest to Management with admin review, mandatory notes, and tier allocation.
5. **Multi-Apartment & Tenant Isolation**
   - Multi-community partitioning (`Community`, `ApartmentBlock`, `ApartmentUnit`, `CommunityMember`).
   - Cross-apartment isolation guards preventing unauthorized management access.
6. **Provider Service Coverage & Search Engine**
   - Multi-geographic coverage (`ProviderServiceArea`) matching city, locality, pin code, and community.
   - 6 core service categories and dynamic subcategories.
7. **Tier Prioritization System**
   - Gold, Silver, Bronze hierarchy with audit logging (`MembershipTierAudit`).
8. **Campaign Management with Image Upload & Soft Deletion**
   - Secure image upload (JPG, PNG, WebP ≤ 5MB) with file preview.
   - Soft deletion of campaigns with historical ledger preservation.
9. **QR Provider Entry & Exit Attendance**
   - HMAC rotating signed tokens with replay prevention and duration calculation.

---

## 3. Incomplete Modules & Potential Vulnerabilities to Validate

1. **Edge-case Input Validation**:
   - Empty or oversized request payloads on service creation, review submission, and role upgrades.
2. **Session Expiry & Stale Tokens**:
   - Behavior when a user role is changed in the database while an active JWT session is maintained in the client browser.
3. **IDOR (Insecure Direct Object Reference) Checks**:
   - Verifying that service requests, conversations, campaigns, and resident records cannot be modified or deleted by other users simply by changing the UUID parameter.
4. **File Upload Security**:
   - Verifying rejection of malicious non-image file extensions, double extensions (`.png.exe`), zero-byte files, and oversized files (>5MB).
5. **Mobile Viewport Overflow**:
   - Checking table rendering and card overflows on smaller screens (390px, 430px, 768px).

---

## 4. Complete Available API Endpoint Catalog (41 Endpoints)

### Authentication & Identity
- `POST /api/v1/auth/register`: User self-registration (GUEST, RESIDENT).
- `POST /api/v1/auth/login`: Credential authentication & JWT issuance.
- `POST /api/v1/auth/logout`: Session cookie invalidation.
- `GET /api/v1/auth/me`: Authenticated profile & role retrieval.
- `POST /api/v1/auth/otp/send`: Phone verification code dispatch.
- `POST /api/v1/auth/otp/verify`: Phone verification code validation.
- `POST /api/v1/auth/switch-role`: Administrative persona switching (Admin only).

### Guest Upgrade Applications
- `POST /api/v1/guest/upgrade`: Submit role upgrade application.
- `GET /api/v1/guest/applications`: Retrieve user's upgrade application history.

### Admin Governance
- `GET /api/v1/admin/approvals`: Retrieve pending resident and provider approvals.
- `POST /api/v1/admin/approvals`: Approve or reject pending applications.
- `GET /api/v1/admin/upgrades`: Query guest upgrade applications.
- `GET /api/v1/admin/upgrades/[id]`: Retrieve upgrade application details.
- `POST /api/v1/admin/upgrades/[id]`: Review, approve, reject, or assign tier.
- `GET /api/v1/admin/memberships`: View and query provider and business tiers.
- `POST /api/v1/admin/memberships`: Assign or modify membership tier (Gold/Silver/Bronze).
- `GET /api/v1/admin/users`: Query all platform users and filter by role/status.

### Community & Tenant Management
- `GET /api/v1/apartments`: List active apartment communities.
- `POST /api/v1/apartments`: Create a new apartment community.
- `GET /api/v1/apartments/[id]`: Get apartment details, blocks, and units.
- `GET /api/v1/apartments/[id]/blocks`: Retrieve blocks for an apartment.
- `GET /api/v1/apartments/[id]/residents`: Retrieve residents (Management/Admin only).
- `GET /api/v1/apartments/[id]/applications`: Retrieve resident registration requests.
- `POST /api/v1/apartments/[id]/applications/[appId]`: Approve/reject resident request.

### Services & Marketplace
- `GET /api/v1/categories`: List 6 root service categories with subcategories.
- `GET /api/v1/categories/[slug]`: Get category details by slug.
- `GET /api/v1/services`: Query published service listings.
- `POST /api/v1/services`: Create new service listing (Provider only).
- `GET /api/v1/providers`: Query approved providers with location and tier sorting.
- `GET /api/v1/providers/[id]`: Detailed provider profile, listings, and reviews.
- `POST /api/v1/provider-service-areas`: Add geographic coverage area.

### Service Requests & Job Orders
- `GET /api/v1/requests`: Query user's requests (Resident or Provider).
- `POST /api/v1/requests`: Resident books a doorstep service request.
- `GET /api/v1/requests/[id]`: View service request details and status history.
- `PATCH /api/v1/requests/[id]`: Update status (Accept, Schedule, Complete, Cancel).

### QR Gate Attendance
- `POST /api/v1/qr/gate-token`: Generate time-bounded signed QR token.
- `POST /api/v1/qr/scan`: Record gate entry or exit scan with cryptographic check.
- `GET /api/v1/provider-visits`: Query visit logs for today or history.
- `PATCH /api/v1/provider-visits/[id]/manual-correction`: Society management audit adjustment.

### Local Business & Campaigns
- `GET /api/v1/businesses`: List approved local businesses.
- `POST /api/v1/businesses`: Register local business profile.
- `GET /api/v1/campaigns`: Query active campaigns for community feed.
- `POST /api/v1/campaigns`: Launch new advertising campaign.
- `DELETE /api/v1/campaigns/[id]`: Soft-delete advertising campaign with audit log.
- `POST /api/v1/uploads`: Multi-format image uploader (JPG, PNG, WebP).

### Subscriptions & Monetization
- `GET /api/v1/plans`: List free and paid subscription tiers.
- `POST /api/v1/subscriptions`: Subscribe to plan.
- `POST /api/v1/payments`: Process sandbox payment transaction.
- `GET /api/v1/monetization`: Query platform revenue metrics.

### Collaboration & Community
- `GET /api/v1/requirements`: Query domestic helper job requirements.
- `POST /api/v1/requirements`: Resident posts a helper requirement.
- `POST /api/v1/requirements/[id]/apply`: Provider applies for requirement.
- `GET /api/v1/conversations`: List in-app chats.
- `GET /api/v1/conversations/[id]/messages`: Retrieve chat message thread.
- `POST /api/v1/conversations/[id]/messages`: Send direct message.
- `POST /api/v1/reviews`: Submit review for completed service.
- `GET /api/v1/notifications`: Retrieve user notifications.
- `POST /api/v1/reports`: Submit community moderation report.

---

## 5. Existing Test Coverage

- `scripts/test-role-auth-system.js`: 15 scenarios covering roles, authentication, middleware, and permissions (100% pass rate).
- `scripts/test-v3-requirements.js`: 13 scenarios covering guest authentication, tiers, upgrade applications, and navigation (100% pass rate).
- `scripts/test-v2-additional-requirements.js`: 11 scenarios covering public homepage, campaign uploads, and soft deletion (100% pass rate).
- `scripts/test-e2e.js`: 12 scenarios covering full apartment setup, resident invitations, provider coverage, QR scans, and security (100% pass rate).
- **Total Existing Tests**: 51 automated tests with zero failures.

---

## 6. Major Technical Risks Identified

1. **Role State Desynchronization**: If a user role is changed by an admin in the database, existing active JWT cookies on client devices might retain the previous role until re-authentication.
   - *Mitigation to verify*: Verify whether `/api/v1/auth/me` always fetches the latest database status and whether middleware rejects stale roles.
2. **Cross-Apartment Data Leakage (IDOR)**:
   - *Mitigation to verify*: Society Management must be strictly barred from querying resident details of a different `communityId` by tampering with API parameters.
3. **File Upload Interception**:
   - *Mitigation to verify*: Files uploaded to `/api/v1/uploads` must enforce strict magic-byte / MIME checks and reject non-image payloads.
4. **QR Attendance Replay**:
   - *Mitigation to verify*: QR tokens must enforce expiry timestamps and single-use entry/exit transitions.

---

## 7. Initial Defects Identified for QA Investigation

1. **Defect D-01 (API Error Handling on Malformed JSON)**: Need to verify if all API route handlers safely catch `SyntaxError` on malformed JSON bodies without throwing 500 Uncaught Server Exceptions.
2. **Defect D-02 (Mobile Nav Drawer Close on Selection)**: Ensure all links in mobile menu automatically dismiss the hamburger drawer upon navigation.
3. **Defect D-03 (Service Area Deletion / Editing)**: Verify if deleting or modifying a provider service area correctly updates search results without orphan constraints.
4. **Defect D-04 (Campaign Date Bounds)**: Ensure campaigns cannot be created with `endDate` before `startDate`.

---

## Audit Sign-off
Initial codebase audit completed. Proceeding to comprehensive QA test plan and execution.
