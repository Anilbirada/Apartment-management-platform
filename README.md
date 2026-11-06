# Enterprise Apartment Management & Local Services Marketplace SaaS

[![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-teal?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)]()
[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-emerald?style=for-the-badge)]()

> A full-stack, enterprise-grade multi-apartment community platform and hyperlocal services marketplace. Built with Next.js 14 App Router, Prisma ORM, JWT-based RBAC across 5 user roles, cryptographically signed QR entry/exit gate passes, persistent media uploads, and a strict **Zero Phone-Number Leakage** privacy architecture.

---

## 📑 Table of Contents

1. [Executive Summary & Product Vision](#-executive-summary--product-vision)
2. [Architectural Overview & Tech Stack](#-architectural-overview--tech-stack)
3. [Five Distinct User Roles & Capabilities](#-five-distinct-user-roles--capabilities)
4. [Core Features & Modules](#-core-features--modules)
   - [Public Main Website with Optional Login](#1-public-main-website-with-optional-login-requirement-10)
   - [Multi-Apartment Community Administration](#2-multi-apartment-community-administration)
   - [Doorstep Services Marketplace](#3-doorstep-services-marketplace)
   - [Dedicated Domestic Hiring Hub (Requirements)](#4-dedicated-domestic-hiring-hub-requirements)
   - [Local Business Profiles & Subscriptions](#5-local-business-profiles--subscriptions)
   - [Campaign Image Upload & Soft Deletion](#6-campaign-image-upload--soft-deletion-requirements-11--12)
   - [Cryptographic QR Entry/Exit Attendance](#7-cryptographic-qr-entryexit-attendance)
   - [Zero Phone-Leakage In-App Messaging](#8-zero-phone-leakage-in-app-messaging)
   - [Platform Monetization & Revenue Analytics](#9-platform-monetization--revenue-analytics)
5. [Step-by-Step Setup & How to Run](#-step-by-step-setup--how-to-run)
6. [Database Configuration & Environment Variables](#-database-configuration--environment-variables)
7. [Pre-configured Demo Accounts & Login Credentials](#-pre-configured-demo-accounts--login-credentials)
8. [Automated Verification & Test Suites](#-automated-verification--test-suites)
9. [Project Directory Structure](#-project-directory-structure)
10. [Security & Compliance Standards](#-security--compliance-standards)

---

## 🌟 Executive Summary & Product Vision

Modern gated communities face recurring operational friction:
1. **Unvetted Outside Labor**: Security guards lack reliable digital logs for domestic maids, cooks, and technicians.
2. **Privacy Violations**: Residents' and domestic workers' private telephone numbers are frequently leaked via guard desks or public bulletin boards.
3. **Fragmented Commerce**: Local neighborhood businesses (grocers, pharmacies, hardware shops) struggle to reach nearby gated societies without paying exorbitant aggregator commissions.

This platform solves these problems as a single, centralized multi-tenant SaaS application that isolates resident records by apartment, connects verified local tradespeople across multiple societies, facilitates subscription-based neighborhood business advertisements, and secures campus entry using rotating, signed QR tokens.

---

## 🏗️ Architectural Overview & Tech Stack

```mermaid
graph TD
    A[Client Browser / Desktop / Mobile] --> B[Next.js 14 App Router Reverse Proxy]
    B --> C[Public Website & Optional Login /]
    B --> D[Role-Based Protected Portals]
    D --> D1[Resident Portal]
    D --> D2[Society Management Portal]
    D --> D3[Service Provider Hub]
    D --> D4[Local Business Hub]
    D --> D5[Platform Admin Console]
    B --> E[RESTful API v1 Engine]
    E --> F[JWT & RBAC Security Guard]
    E --> G[HMAC-SHA256 QR Verification]
    E --> H[Prisma ORM Layer]
    H --> I[(SQLite / PostgreSQL Database)]
    E --> J[Persistent File Storage: public/uploads/]
```

| Layer | Technologies & Implementations |
| :--- | :--- |
| **Frontend Framework** | **Next.js 14.2.35** (App Router), React 18, TypeScript 5.0 |
| **Styling & Design** | **Tailwind CSS 3.4**, Lucide React Icons, Responsive Multi-theme Engine |
| **Backend & APIs** | Next.js Server Components, Route Handlers (`/api/v1/...`), RESTful Architecture |
| **Database & ORM** | **Prisma ORM 5.22**, Normalized Relational Schema (21 Models), SQLite (Zero-Config local) / PostgreSQL ready |
| **Authentication & RBAC**| Stateless **JWT Tokens** in HTTP-only Cookies, bcryptjs password hashing, E.164 phone normalization |
| **Cryptographic Security**| **HMAC-SHA256** timestamped token signing for 60-second rotating QR attendance |
| **File Persistence** | Multipart form file storage with MIME type inspection and 5MB size limits (`public/uploads/campaigns/`) |
| **Theming System** | 3 Persistent User Themes: **Light Mode**, **Dark Mode**, and **Festival Theme** |
| **Localization Engine** | Multi-language engine supporting **English (en)**, **Hindi (hi)**, and **Kannada (kn)** |

---

## 👥 Five Distinct User Roles & Capabilities

The application implements strict role-based access control (RBAC):

```mermaid
classDiagram
    class User {
        +String id
        +String name
        +String email
        +String phone
        +RoleType role
        +String status
    }
    class Resident {
        +Book Services()
        +Post Requirements()
        +Chat With Providers()
        +View Free Local Deals()
    }
    class SocietyManagement {
        +Approve Residents()
        +Monitor QR Attendance()
        +Broadcast Notices()
        +Manage Blocks & Flats()
    }
    class ServiceProvider {
        +Upload Verification IDs()
        +Set Service Areas()
        +Scan Gate QR Token()
        +Manage Job Requests()
    }
    class LocalBusiness {
        +Subscribe to Plans()
        +Upload Campaign Images()
        +Soft Delete Campaigns()
        +Track Impressions & CTR()
    }
    class PlatformAdmin {
        +Master Community CRUD()
        +Review Approvals()
        +Monetization Analytics()
        +Audit System Logs()
    }
    User <|-- Resident
    User <|-- SocietyManagement
    User <|-- ServiceProvider
    User <|-- LocalBusiness
    User <|-- PlatformAdmin
```

---

## 📦 Core Features & Modules

### 1. Public Main Website with Optional Login (Requirement 10)
- **Open Public Portal (`/`)**: Visitors explore the website without being forced to log in.
- **Prominent Navigation**: Visible **Sign In** and **Sign Up** action buttons on desktop and mobile drawer navigation.
- **Dynamic Role Redirection**: Logging in automatically redirects users to their authorized workspace (`/management/dashboard`, `/business/dashboard`, `/provider/dashboard`, `/admin`, or `/`).
- **Public Exploration Sections**:
  - `PublicCommunitiesSection.tsx` (`#communities`): Showcases verified apartment complexes (Palm Heights, Green Valley, Silver Oak) with zero resident privacy leakage.
  - `PublicBusinessesSection.tsx` (`#businesses`): Explores neighborhood grocers, pharmacies, and hardware stores.
  - `HowItWorksSection.tsx` (`#how-it-works`): Interactive 4-role breakdown.
  - Multi-column enterprise `Footer.tsx` with role links and compliance badges.

### 2. Multi-Apartment Community Administration
- Supports multiple isolated apartment complexes under one platform.
- Hierarchical structure: **Apartment Community $\rightarrow$ Blocks $\rightarrow$ Floors $\rightarrow$ Flats/Units**.
- Two resident onboarding paths:
  - **Option 1**: Management invites residents with automated account generation.
  - **Option 2**: Resident self-registration with society approval queue and rejection auditing.
- Strict multi-tenant query isolation preventing cross-apartment data exposure.

### 3. Doorstep Services Marketplace
- 6 dynamic service categories with 36 curated subcategories:
  1. *Home Maintenance* (Plumbing, Electrical, Carpentry, Painting, Appliance Repair)
  2. *Cleaning & Housekeeping* (Maids, Deep Cleaning, Pest Control)
  3. *Vehicle Care* (Basement Car Wash, Detailing, Bike Servicing)
  4. *Household & Personal* (Cooks, Babysitters, Elder-care, Chauffeurs)
  5. *Education & Skills* (Home Tuitions, Coding, Music, Languages)
  6. *Professional Services* (Chartered Accountants, Legal Consultation, Tax)
- Full 6-stage lifecycle tracking: `Requested` $\rightarrow$ `Accepted` $\rightarrow$ `Visit Scheduled` $\rightarrow$ `In Progress` $\rightarrow$ `Completed` $\rightarrow$ `Reviewed`.

### 4. Dedicated Domestic Hiring Hub (Requirements)
- **Strictly separate from services**:
  - *Services* = Providers offering standard pre-priced jobs.
  - *Requirements* = Residents posting openings to hire long-term domestic staff (cooks, full-time maids, nannies, chauffeurs).
- Candidate application management, salary negotiation, applicant shortlisting, and hiring workflow.

### 5. Local Business Profiles & Subscriptions
- Neighborhood merchants (Grocery, Pharmacy, Restaurant, Salon, Hardware, Cleaning Agencies).
- Free and Paid membership plans (Starter, Growth, Enterprise).
- Automated UPI/Card payment integration with server-side signature verification and idempotency.

### 6. Campaign Image Upload & Soft Deletion (Requirements 11 & 12)
- **Image Upload (`POST /api/v1/uploads`)**:
  - Replaced manual URL input with a drag-and-drop file uploader.
  - Supports `JPG`, `JPEG`, `PNG`, and `WebP` up to **5MB**.
  - Client-side & server-side MIME type verification with instant preview, replace, and remove actions.
  - Persisted to `public/uploads/campaigns/` returning persistent URLs (`/uploads/campaigns/...`).
- **Soft Deletion (`DELETE /api/v1/campaigns/[id]`)**:
  - Action button on campaign cards with confirmation modal displaying the campaign title and optional reason.
  - Strict ownership check preventing unauthorized deletion of other merchants' campaigns.
  - Soft-deletes record (`status: "DELETED"`, `deletedAt`, `deletedById`, `deletionReason`).
  - Immediately removed from resident ad feeds while preserving payment receipts and `CampaignAuditLog` records.

### 7. Cryptographic QR Entry/Exit Attendance
- Security gate tokens generated using **HMAC-SHA256** signatures with 60-second expiration.
- Mobile browser scanner for service providers.
- Validates approved provider status, scheduled appointment, and correct gate.
- Automatically records entry timestamp, exit timestamp, and computes total duration on campus.
- Society Management live dashboard and manual fallback correction log with mandatory reason audit trails.

### 8. Zero Phone-Leakage In-App Messaging
- Phone numbers are permanently stripped from public and resident-facing API payloads.
- Encrypted in-app messaging threads between residents, providers, and society offices.
- Reviews display only the reviewer's first name and apartment block (e.g., `Rahul, Tower B`).

### 9. Platform Monetization & Revenue Analytics
- Dedicated Platform Administrator Monetization Console (`/admin/monetization`).
- 100% database-calculated metrics: Monthly Recurring Revenue (MRR), Lifetime Revenue, ARPU, active subscriptions, and real-time transaction ledger.

---

## 🚀 Step-by-Step Setup & How to Run

Follow these easy steps to get the application up and running on your local machine.

### Step 1: Clone the Repository
```bash
git clone https://github.com/Anilbirada/Apartment-management-platform.git
cd Apartment-management-platform
```

### Step 2: Install Node Dependencies
Ensure you have Node.js 18+ or 20+ installed.
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to create your local `.env` file:
```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On Linux / macOS:
cp .env.example .env
```

The default `.env` is pre-configured for local SQLite zero-config execution:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="super-secret-jwt-token-apartment-management-saas-2026"
QR_HMAC_SECRET="dev_qr_attendance_super_secret_signing_key_2026"
NEXT_PUBLIC_APP_NAME="PalmHeights Living"
NEXT_PUBLIC_APP_TAGLINE="Premium Apartment Management & Community Services Marketplace"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 4: Setup Database & Generate Prisma Client
Push the schema to your database and generate the Prisma Client:
```bash
npx prisma generate
npx prisma db push
```

### Step 5: Seed Sample Data
Populate the database with realistic multi-community data (3 apartment societies, 5 role user accounts, service listings, businesses, subscription plans, and notices):
```bash
node prisma/seed.js
```

### Step 6: Start the Development Server
```bash
npm run dev
```

Open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

### Step 7: Build for Production (Optional)
To verify an optimized production build:
```bash
npm run build
npm start
```

---

## 🗄️ Database Configuration & Environment Variables

### 1. Local Zero-Config Setup (SQLite)
By default, the platform uses SQLite stored at `prisma/dev.db`. No separate database server installation is required.
```env
DATABASE_URL="file:./dev.db"
```

### 2. Production PostgreSQL Setup
To connect to an enterprise PostgreSQL instance (Supabase, Neon, AWS RDS, or Docker PostgreSQL):

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `.env` with your PostgreSQL credentials:
   ```env
   # PostgreSQL Connection Format:
   # postgresql://<USERNAME>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>?schema=public
   DATABASE_URL="postgresql://postgres:YourSecureDatabasePassword2026!@localhost:5432/apartment_management_db?schema=public"
   ```
3. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   node prisma/seed.js
   ```

---

## 🔑 Pre-configured Demo Accounts & Login Credentials

Every pre-seeded account uses the same default development password:
👉 **Password**: `Password123!`

You can log in via **[http://localhost:3000/login](http://localhost:3000/login)** or use the interactive **Role Persona Switcher** in the top navigation bar.

| Role | Name | Email | Password | Entity / Tower / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Authenticated Guest** | Kavita Nair | `guest.demo@palmheights.com` | `GuestPass123!` | Guest Dashboard & Role Upgrades |
| **Apartment Resident** | Rahul Sharma | `rahul.sharma@gmail.com` | `Password123!` | Palm Heights (Tower B - 304, Owner) |
| **Apartment Resident** | Priya Patel | `priya.patel@gmail.com` | `Password123!` | Palm Heights (Tower A - 1202, Tenant) |
| **Society Management** | Sunita Deshmukh | `manager@palmheights.com` | `Password123!` | Palm Heights Estate Office |
| **Service Provider** | Ramesh Kumar | `ramesh.plumber@gmail.com` | `Password123!` | Master Plumbing Works (₹299+, Gold Tier) |
| **Service Provider** | Suresh Varma | `suresh.electrician@gmail.com` | `Password123!` | Sparkle Electric Services (₹249+, Silver Tier) |
| **Service Provider** | Anita Devi | `anita.cleaning@gmail.com` | `Password123!` | CleanHome Deep Cleaning (₹499+, Bronze Tier) |
| **Local Business** | Rohan Singhal | `owner@namastefresh.com` | `Password123!` | Namaste Fresh Mart (Gold Tier Supermarket) |
| **Platform Administrator** | Vikramaditya Rao | `admin@palmheights.com` | `Password123!` | Master Platform Administrator |

---

## 🧪 Automated Verification & Test Suites

The project includes three comprehensive test suites verifying all 36 core scenarios end-to-end:

### Suite 1: Version 3.0 Customer Requirements Suite
```bash
node scripts/test-v3-requirements.js
```
**Test Coverage (13/13 Passed)**:
- `11.1`: Public Homepage & General Info accessible without auth
- `11.2`: Marketplace provider listings require authentication & active check
- `11.3`: Guest account registration creates active verified guest with no apartment ties
- `11.4`: Seeded Guest Demo user validated with GUEST role
- `12.1`: Providers and Businesses have tier fields defaulting to BRONZE
- `12.2`: Tier Priority Ordering logic (GOLD > SILVER > BRONZE)
- `12.3`: Membership Tier Audit logging and entity relations
- `13.1`: Guest can submit RoleUpgradeApplication with PENDING_REVIEW state
- `13.2`: Admin inspects application details and submitted documents
- `13.3`: Admin approves application -> User elevated to target role with assigned tier
- `13.4`: Admin rejection flow enforces mandatory rejection reason
- `14.1`: Switch-role endpoint is restricted to ADMIN role only (403 Forbidden for non-admins)
- `14.2`: Navigation mappings configured for all 6 distinct roles

### Suite 2: Additional Requirements Verification (Req 10, 11, 12)
```bash
node scripts/test-v2-additional-requirements.js
```
**Test Coverage (11/11 Passed)**:
- `10.1`: Public visitor views communities without authentication
- `10.2`: Public visitor explores approved neighborhood businesses
- `10.3`: Multi-role accounts validated for all roles
- `11.1`: Persistent upload storage directory validated
- `11.2`: File validation (JPG/PNG/WebP, max 5MB size limit)
- `11.3`: Save campaign record with image metadata
- `12.1`: Active campaign appears in resident ad feed
- `12.2`: Soft deletion by owner with reason and audit log
- `12.3`: Immediate removal from resident-facing feeds
- `12.4`: `CampaignAuditLog` metrics and historical preservation
- `12.5`: Preservation of payment transactions and subscription invoices

### Suite 3: Core Platform Regression Suite (12 Core Scenarios)
```bash
node scripts/test-e2e.js
```
**Test Coverage (12/12 Passed)**:
- `Scenario 1`: Admin Creates Apartment, Blocks, Units & Gates
- `Scenario 2`: Society Management Invites Residents
- `Scenario 3`: Resident Self-Registration & Approval Queue
- `Scenario 4`: Provider Multi-Geographic Coverage & Filtering
- `Scenario 5`: Local Business Registration & Category Assignment
- `Scenario 6`: Subscription Upgrade with HMAC Verification & Idempotency
- `Scenario 7`: Free Membership Plan Allocation
- `Scenario 8`: Sponsored Ad Campaign Creation & Status
- `Scenario 9`: Service Booking & Zero Phone Leakage
- `Scenario 10`: Signed Rotating QR Entry Scan & State Transition
- `Scenario 11`: Signed Rotating QR Exit Scan & Duration Calculation
- `Scenario 12`: Security Tests (Expired QR Rejection, Tampering, Tenant Isolation)

---

## 📁 Project Directory Structure

```text
├── prisma/
│   ├── schema.prisma              # 21 Relational Database Models
│   ├── seed.js                    # Comprehensive Multi-Community Seed Script
│   └── dev.db                     # Local SQLite Database
├── public/
│   ├── uploads/
│   │   └── campaigns/             # Persistent Campaign Image Uploads
│   └── favicon.ico
├── scripts/
│   ├── test-e2e.js                # Core Platform 12-Scenario E2E Test Suite
│   └── test-v2-additional-requirements.js # Requirements 10, 11, 12 Test Suite
├── src/
│   ├── app/
│   │   ├── admin/                 # Platform Admin Dashboards & Approvals
│   │   │   ├── apartments/        # Community Master Management
│   │   │   ├── approvals/         # Provider & Listing Moderation Queue
│   │   │   └── monetization/      # Real-Time Revenue & Subscriptions
│   │   ├── api/v1/                # 24 RESTful Server Route Handlers
│   │   │   ├── admin/approvals/
│   │   │   ├── apartments/
│   │   │   ├── auth/              # Login, Logout, Register, OTP, Switch Role
│   │   │   ├── businesses/
│   │   │   ├── campaigns/         # Ads Feed, Tracking, Soft Deletion
│   │   │   ├── monetization/
│   │   │   ├── payments/
│   │   │   ├── plans/
│   │   │   ├── provider-visits/
│   │   │   ├── providers/
│   │   │   ├── qr/                # Rotating Gate Token & Scan Engine
│   │   │   ├── requests/
│   │   │   ├── requirements/      # Feature 5 Domestic Hiring
│   │   │   ├── subscriptions/
│   │   │   └── uploads/           # Persistent Media Upload Endpoint
│   │   ├── business/dashboard/    # Local Business Hub & Campaign Manager
│   │   ├── management/dashboard/  # Society Management Portal & Gate Logs
│   │   ├── messages/              # Zero-Phone Leakage Chat Center
│   │   ├── provider/dashboard/    # Provider Job Queue & Earnings
│   │   ├── register/              # Multi-Role Self-Registration
│   │   ├── requests/              # Resident Booking Lifecycle Tracker
│   │   ├── requirements/          # Feature 5 Hiring Feed
│   │   ├── services/              # Marketplace Discovery & Filters
│   │   ├── layout.tsx             # Root Layout with Theme & AppProvider
│   │   └── page.tsx               # Public Main Website (Requirement 10)
│   ├── components/
│   │   ├── home/                  # Public Communities, Businesses, How It Works
│   │   ├── layout/                # Navbar with Public Auth, Footer
│   │   ├── requirements/          # Post Requirement Modals
│   │   └── services/              # Booking Wizard & Provider Cards
│   ├── context/
│   │   └── AppContext.tsx         # Global Auth, Theming & Localization State
│   └── lib/
│       ├── auth.ts                # JWT Verification & RBAC Guards
│       ├── prisma.ts              # Global Prisma Client Singleton
│       ├── qrCrypto.ts            # HMAC-SHA256 Token Signing & Validation
│       └── theme.ts               # Light, Dark, Festival Design Tokens
├── .env.example                   # Environment Configuration Template
├── API_DOCUMENTATION.md           # Full Endpoint Specifications
├── FEATURE_IMPLEMENTATION_TRACKER.md # Requirement Verification Tracker
├── PROJECT_AUDIT.md               # Architectural Audit Document
└── README.md                      # Project Master Documentation
```

---

## 🔒 Security & Compliance Standards

1. **Zero Phone-Number Leakage**:
   Resident and provider phone numbers are stripped at the ORM serialization layer. Public communication is mediated exclusively via `/api/v1/conversations`.
2. **Cryptographic QR Anti-Replay Tokens**:
   Gate passes rotate every 60 seconds with HMAC-SHA256 signatures. Stale or replayed tokens are automatically rejected.
3. **Multi-Tenant Data Isolation**:
   Apartment resident rosters and gate access logs are scoped to the authenticated user's society. Society managers cannot access neighboring societies' data.
4. **Soft Deletion with Audit Logging**:
   Promotions can be stopped immediately by business owners while keeping financial payments, impression statistics, and tax records preserved in `CampaignAuditLog`.
5. **Review Authenticity**:
   Reviews can only be submitted for bookings in `COMPLETED` status, and reviewer names are masked to first name and tower only.

---

## 📄 License & Attribution

Developed with commercial software engineering standards for the **Enterprise Apartment Management & Local Marketplace SaaS Platform**. All rights reserved © 2026.
