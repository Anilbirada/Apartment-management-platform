# PROJECT AUDIT: ENTERPRISE APARTMENT MANAGEMENT & LOCAL SERVICES MARKETPLACE

**Audit Date**: November 03, 2026  
**Auditor**: Principal Full-Stack AI Engineer & Enterprise Software Architect  
**Project**: Apartment Management & Local Business Marketplace Platform  
**Target Environment**: Next.js 14 App Router, TypeScript, Prisma ORM, SQLite/PostgreSQL, Tailwind CSS

---

## 1. Executive Summary

This audit evaluates the current state of the Apartment Management Web Application against the newly defined enterprise requirements. The current system was developed as a single-society community services marketplace ("Palm Heights Residences") supporting 4 primary roles (`RESIDENT`, `PROVIDER`, `MANAGEMENT`, `ADMIN`). It possesses robust marketplace workflows for booking, messaging, privacy preservation, requirements posting, and admin approvals.

To achieve the client's enterprise vision, the platform must be elevated from a single-apartment demonstration system into a **multi-apartment SaaS platform with 5 distinct user roles, isolated society administrations, local geographic service coverage, local business directory & advertising campaigns, full monetization with subscription lifecycles, and a secure QR-based provider entry/exit attendance system**.

All existing working code, database entities, business logic, and API endpoints must and will be strictly preserved.

---

## 2. Existing System Architecture Inspection

### 2.1 Frontend Framework
- **Framework**: Next.js 14.2.20 (App Router)
- **Language**: TypeScript 5.6.3, React 18.3.1
- **Styling**: Tailwind CSS 3.4.14 with custom themes (Light, Dark, Festival) in `src/lib/theme.ts`
- **Component Libraries**: Lucide React icons, Framer Motion, Recharts
- **State Management**: React Context (`src/context/AppContext.tsx`) with localStorage persistence for language and theme
- **Internationalization**: Lightweight custom i18n supporting English, Hindi, and Kannada (`src/lib/i18n.ts`)

### 2.2 Backend Framework & API Architecture
- **API Engine**: Next.js Route Handlers under `src/app/api/v1/`
- **Routing Structure**:
  - `auth`: `login`, `logout`, `me`, `register`, `switch-role`
  - `categories`: `GET /categories`, `POST /categories`, `GET /categories/[slug]`
  - `providers`: `GET /providers`, `GET /providers/[id]`
  - `services`: `GET /services`, `POST /services`
  - `requests`: `GET /requests`, `POST /requests`, `PATCH /requests/[id]`
  - `requirements`: `GET /requirements`, `POST /requirements`, `GET /requirements/[id]`, `POST /requirements/[id]/apply`, `PATCH /requirements/[id]`
  - `conversations`: `GET /conversations`, `POST /conversations`, `GET /conversations/[id]/messages`, `POST /conversations/[id]/messages`
  - `reviews`: `GET /reviews`, `POST /reviews`
  - `notifications`: `GET /notifications`, `PATCH /notifications`
  - `reports`: `GET /reports`, `POST /reports`
  - `admin/approvals`: `GET /admin/approvals`, `POST /admin/approvals`

### 2.3 Database Architecture & Schema
- **Database Engine**: SQLite configured via `DATABASE_URL="file:./dev.db"` (compatible with PostgreSQL in production)
- **ORM**: Prisma 5.22.0 (`prisma/schema.prisma`)
- **Current Models (21 entities)**:
  - `User`, `Community`, `CommunityMember`, `ResidentProfile`, `ProviderProfile`, `ProviderDocument`
  - `Category`, `SubCategory`, `ServiceListing`, `ServiceAvailability`
  - `ServiceRequest`, `RequestStatusHistory`, `Requirement`, `RequirementApplication`
  - `Conversation`, `Message`, `Review`, `Notification`, `NotificationPreference`, `Report`, `AdminApproval`

### 2.4 Authentication Implementation
- **Tokens**: JSON Web Tokens (JWT) signed with `JWT_SECRET` (`HS256`, 7-day expiration)
- **Transport**: Authorization Header (`Bearer <token>`) and HTTP-Only Cookie (`token`)
- **Password Security**: `bcryptjs` (salt rounds: 10)
- **Roles Currently Supported**: `RESIDENT`, `PROVIDER`, `MANAGEMENT`, `ADMIN`

---

## 3. Detailed Audit by Functional Module

| Module | Current Status | Current Capabilities | Deficiencies / Required Modifications |
| :--- | :--- | :--- | :--- |
| **Authentication & RBAC** | Partially Complete | Email + password login, basic register, JWT session, role switching for demo | • Missing mobile OTP flow.<br>• Missing 5th role: `LOCAL_BUSINESS`.<br>• Need unified user identity with multiple role assignments and apartment/business contexts.<br>• Need database uniqueness constraints on normalized phone and email.<br>• Need account recovery/forgot password. |
| **Multi-Apartment System** | Single Community Only | Single `Community` model ("Palm Heights"), users tied via `communityId` and `CommunityMember` | • Platform admin cannot create new apartments, blocks, floors, or units from UI.<br>• Society management cannot invite residents or configure onboarding mode.<br>• Resident self-registration approval queue does not exist.<br>• Database queries do not strictly enforce multi-apartment tenant isolation. |
| **Service Providers & Service Areas** | Complete for Single Society | Provider profiles, documents, listings, weekly availability, approval queue | • Providers are bound to single text `serviceArea`.<br>• Missing multi-locality, city, PIN code, and multi-apartment coverage configuration.<br>• Resident search only queries categories, not geo/PIN/apartment coverage.<br>• Missing paid vs. free provider account entitlements. |
| **Local Businesses** | **Missing** | None | • No `LocalBusiness` model or business profile.<br>• No business dashboard.<br>• No business categories or operating areas.<br>• No separation between service providers and local business owners. |
| **Subscriptions & Monetization** | **Missing** | No subscription models, hardcoded pricing | • No `SubscriptionPlan`, `Subscription`, or `PaymentTransaction` tables.<br>• No monetization dashboard for Platform Admin.<br>• No payment gateway integration or webhook verification.<br>• No subscription status enforcement (Free, Pending, Active, Expired). |
| **Advertising Campaigns** | **Missing** | None | • No advertising campaign model or target community mapping.<br>• No business campaign creation wizard.<br>• No resident sponsored advertisement banner display.<br>• No admin campaign moderation or scheduling. |
| **Provider QR Entry/Exit** | **Missing** | None | • No `ProviderVisit`, `ApartmentGate`, or `QRTokenRecord` tables.<br>• No mobile camera QR scanner.<br>• No backend signature verification or entry/exit state machine.<br>• No Society Management visit monitoring dashboard or manual admin correction fallback. |
| **Community Marketplace (Original)** | **Fully Working** | Home hero, 6 service categories, discovery filters, booking modal, 6-stage request tracking, Feature 5 requirements hub, private chat, completed-job reviews | • Must be preserved 100% without breaking changes.<br>• Hook into multi-apartment and local area matching seamlessly. |

---

## 4. Technical Debt & Limitations Identified

1. **Hardcoded Community Assumption**: Current seed script and registration assume a single default community (`Palm Heights`). APIs like `GET /providers` and `POST /requests` do not filter by dynamic tenant apartment IDs.
2. **Missing Normalization**: User emails and mobile numbers are not normalized to standard E.164 formats, risking duplicate accounts with minor format variations.
3. **Database Model Gaps**: 12 new tables or schema extensions are required to support multi-tenancy, local businesses, advertising campaigns, subscriptions, payments, and QR attendance.
4. **Mocked Statistics**: Some admin stats in `src/app/admin/page.tsx` fall back to hardcoded counts (e.g. `8`, `3`, `1`) if query parameters are missing. All statistics must be strictly computed from real database records.

---

## 5. Required Modifications Roadmap

1. **Database Schema Upgrade**: Safely extend `schema.prisma` without destroying existing records. Add Apartment blocks/units, ProviderServiceAreas, LocalBusiness, BusinessCampaigns, Subscriptions, Payments, and ProviderVisits.
2. **Identity & Authentication Engine**: Upgrade auth API to handle normalized mobile and email identities, OTP simulation / external gateway readiness, and the 5 distinct roles.
3. **Multi-Apartment Administration Module**: Implement Platform Admin apartment CRUD, Society Management apartment portal, block/floor/unit manager, resident invitation generator, and resident self-registration approval workflow.
4. **Local Service Provider Coverage**: Build provider multi-area coverage management and update resident provider discovery to match apartment location, PIN code, and coverage radius.
5. **Local Business & Advertising Engine**: Build business onboarding, business dashboard, ad campaign builder, admin campaign approval, and resident free ad banner component.
6. **Monetization & Payment Engine**: Build subscription plans, subscription purchasing, server-verified payment processing with transaction logs, and platform admin revenue analytics.
7. **QR Entry/Exit Attendance System**: Implement signed QR token generation, browser camera scanner, visit state machine, society guard/admin dashboard, and audit logs.
8. **End-to-End Verification**: Comprehensive multi-role verification ensuring zero regression in existing marketplace functionality.
