# Palm Heights Residences — Premium Apartment Management & Community Services Marketplace

> **Production-Quality Enterprise Web Application** built for modern luxury gated communities with a verified doorstep service marketplace and independent domestic staff requirements hub.

---

## 🌟 Executive Summary

**Palm Heights Living** is a full-stack, production-ready SaaS platform built for high-density, luxury residential communities. It solves the critical community friction of discovering, vetting, scheduling, and paying for doorstep domestic services while enforcing a **Strict Zero Phone-Number Leakage Policy** to protect resident and provider privacy.

---

## 🏗️ Technical Architecture & Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14.2 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion |
| **Backend** | Next.js Server Architecture, RESTful API (`/api/v1/...`), JWT Authentication, bcryptjs Hashing |
| **Database** | Prisma ORM, Normalized Schema (21 Models), SQLite (Zero-Config local) / PostgreSQL ready |
| **Theme System** | 3 Persistent Themes: **Light** (Teal/Saffron), **Dark** (Navy/Cyan/Illuminated Windows), **Festival** (Maroon/Gold/Rangoli) |
| **Localization** | Multi-language engine supporting **English (en)**, **Hindi (hi)**, and **Kannada (kn)** |
| **Privacy Engine**| Strict server-enforced privacy: phone numbers never exposed; reviewer anonymity (first name + block only) |

---

## 👥 The Four User Roles & Distinct Dashboards

1. **Apartment Residents**
   - Interactive Community Home with animated Indian residential building visual
   - Global search with simulated audio voice recognition
   - 6 dynamic service categories & subservice filter chips
   - Multi-step service booking wizard with scheduled time slots & flat selection
   - Interactive request lifecycle tracker (`Requested` → `Accepted` → `Visit Scheduled` → `In Progress` → `Completed` → `Reviewed`)
   - Completed-only verified review submission with 1-5 star ratings and photo attachments
   - Real-time in-app chat with assigned providers without sharing mobile numbers

2. **Service Providers**
   - Provider registration with Aadhaar / Police clearance document uploads
   - Multi-step **Post a Service** wizard with Day-1 "Apartment Only" visibility lock
   - Dashboard with KPIs: Incoming Requests, Scheduled / Today's Jobs, Completed History, Revenue Est.
   - Accept or Decline jobs with mandatory reason requirement
   - Mark Completed with optional completion photo and work notes
   - In-app communication with residents

3. **Apartment Management**
   - Community-level operational overview & campus notices management
   - Roster monitoring and gate security check pass tracking
   - Oversight of active provider visits across all 4 towers (Tower A, B, C, D)

4. **Platform Administrators**
   - Centralized Administration Console & KPI metrics
   - **Verification & Approval Queue**:
     - *Pending Providers*: Document inspection, identity verification, granting verified badges
     - *Pending Listings*: Reviewing and publishing provider services
     - *Reported Content*: Content moderation and resolving flagged listings/reviews
   - High-Risk Role highlighting (Childcare, Babysitting, Elder-care, Drivers, Household maids)
   - Dynamic database-driven category & subcategory management

---

## 📦 Mandatory Client Modules Implemented

### Module 1: Community Home
- **Animated Apartment Hero**:
  - Modern Indian high-rise building visual with Ken Burns zoom (`animation-ken-burns`)
  - Subtle parallax & softly illuminated windows with pulsating glow in evening mode
  - Drifting clouds layer (`animation-cloud-drift`)
  - 1.2-second first-load reveal (`animation-hero-reveal`)
  - Day / Evening lighting mode toggle
  - Reduced-motion accessibility & static fallback
- Smart Search with simulated voice input (`SpeechRecognition` API)
- Quick entry points: **Offer a Service** & **Post a Requirement**
- Popular Near You provider carousel with INR (₹) starting prices
- Community notices preview (Monsoon Balcony Pre-checks, AGM, EV Chargers)

### Module 2: Dynamic Service Catalog
All 6 client-specified groups configured in database with active subcategories:
1. **Home Maintenance**: Plumber, Electrician, Carpenter, Painter, AC Service, Appliance Repair, RO / Water Purifier
2. **Cleaning & Housekeeping**: Apartment Cleaning Maid, Deep Cleaning, Specialized Cleaning, Pest Control
3. **Vehicle Care**: Car Washing, Car Detailing, Bike Washing, Vehicle Services
4. **Household & Personal**: Cook / Chef, Babysitter, Elder-care, Driver, Laundry & Ironing, Beauty Salon, Fitness Trainer
5. **Education & Skills**: Home Tuition, Spoken English, Coding & Web Dev, Music (Guitar/Keyboard), Drawing/Painting
6. **Professional**: Chartered Accountant / Tax, Legal Consultation, Photography, Web & App Development

### Module 3: Category Pages & Discovery
- Subservice filter chips (e.g., Tap repair, water leakage, pipe repair, MCB wiring)
- Provider cards with avatar, verified badge, rating breakdown, completed job counts, and availability status
- Filtering by price range, rating (4.0+, 4.5+), verified only, and available today
- Sorting by Highest Rating, Lowest Price, and Most Completed Jobs
- Empty states with clear next actions ("Post a Requirement")

### Module 4: Provider Profiles
- Experience, service area, availability schedule
- 5-to-1 star rating breakdown with progress bars
- Customer reviews enforcing the privacy rule (Reviewer's first name & block only)
- Before & after work photo gallery
- Direct actions: **Request Service**, **In-App Chat**, **Report Provider**

### Module 5: Multi-Step Request A Service Wizard
- Step 1: Category & Subservice selection
- Step 2: Preferred visit date, time slot, tower/block & flat number
- Step 3: Problem description, photo upload preview, additional notes
- Step 4: Confirmation screen with unique request ID (`REQ-2026-XXXX`) & track button
- Prominent privacy notice: *"Your phone number is never shared. Chat inside the app."*

### Module 6: My Requests & Request Lifecycle
- Complete lifecycle transitions:
  `Requested` → `Accepted` → `Visit Scheduled` → `In Progress` → `Completed` → `Reviewed`
- Cancellation and Rejection with mandatory reasons
- Review submission modal: Active **only** after job is marked completed
- In-app chat button linking directly to conversation thread

### Module 7: Provider Dashboard
- Incoming requests queue with 1-click accept or decline with mandatory reason
- Today's jobs & upcoming scheduled roster
- Mark Completed action with work notes & completion photo
- Revenue summary and listing approval status badges

### Module 8: Post a Service Wizard
- Multi-step listing creator: Category, Title, Scope, Price Structure (Fixed, Starting Price, Hourly, Per Visit)
- Day-1 Launch Scope: **Apartment Only** active; Community and Public locked with "Coming Soon" badges
- Live interactive card preview before submission
- Listings enter `Pending Approval` state (never auto-published)

### Module 9: Feature 5 — Requirements Hub (Hiring)
- **Strictly separate from services**:
  - Services = Somebody *offers* a service
  - Requirements = Somebody *needs to hire* a domestic staff member
- Categories: Security, Cook, Maid, Housekeeping, Driver, Other
- Distinct visual identity: **Deep Purple / Violet** accents, distinct icons and forms
- Applicant management: Candidates submit cover notes and expected pay; resident can review, chat, shortlist, and select applicant (marking requirement as `FILLED`)

### Module 10: Admin Approval Queue
- 3 approval tabs: Pending Providers, Pending Listings, Reported Content
- Document inspection modal for Aadhaar and Police clearance
- Verification badges: *Verified Resident*, *Verified Service Provider*, *Admin Approved Provider*
- High-risk role callouts (Childcare, Babysitting, Elder-care, Drivers)

### Module 11: Reports & Moderation
- Residents can flag listings, reviews, or providers with reasons and notes
- Admin moderation queue to dismiss or resolve reports

### Module 12: In-App Messaging Center
- Privacy-safe conversation threads between residents and providers
- Real-time message exchange with timestamps and read states
- Zero exposure of telephone numbers

---

## 🔒 Security & Privacy Enforcement Rules

1. **Zero Phone Leakage**: Provider and resident phone numbers are strictly stripped from all public and resident-facing API payloads.
2. **Review Integrity**: Reviews can *only* be created for requests with `COMPLETED` status.
3. **Reviewer Anonymity**: Only the resident's first name and apartment block (e.g. `Rahul, Tower B`) are stored and displayed on reviews.
4. **Listing Gating**: All new provider listings enter `PENDING_APPROVAL` and are hidden from discovery until approved by an admin.
5. **Role-Based API Guard**: Next.js API endpoints validate JWT session and verify permissions before allowing state transitions.

---

## 🚀 Setup & Local Execution Guide

### 1. Prerequisites
- Node.js: `v18+` or `v20+` (tested and verified on Node `v26.7.0`)
- NPM: `v10+` / `v11+`

### 2. Quick Start
```bash
# Clone or navigate to the project directory
cd "e:/apartment manegement"

# Install dependencies (already completed)
npm install

# Push database schema & generate Prisma client
npx prisma generate
npx prisma db push

# Seed the database with realistic sample Indian apartment data
node prisma/seed.js

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm start
```

---

## 🔑 Demo Personas (One-Tap Login)

For instant evaluation, the application includes a **Demo Role Switcher** in the top navigation bar and pre-filled quick login buttons on the `/login` page:

| Persona | Role | Email | Password | Flat / Specialty |
| :--- | :--- | :--- | :--- | :--- |
| **Rahul Sharma** | `RESIDENT` | `rahul.sharma@gmail.com` | `Password123!` | Tower B - 304 |
| **Priya Patel** | `RESIDENT` | `priya.patel@gmail.com` | `Password123!` | Tower A - 1202 |
| **Ramesh Kumar** | `PROVIDER` | `ramesh.plumber@gmail.com` | `Password123!` | Express Plumbing (₹299+) |
| **Suresh Varma** | `PROVIDER` | `suresh.electrician@gmail.com` | `Password123!` | Sparkle Electric (₹249+) |
| **Anita Devi** | `PROVIDER` | `anita.cleaning@gmail.com` | `Password123!` | CleanHome Deep Clean (₹499+) |
| **Sunita Deshmukh** | `MANAGEMENT` | `manager@palmheights.com` | `Password123!` | Estate Manager |
| **Vikramaditya Rao** | `ADMIN` | `admin@palmheights.com` | `Password123!` | Society President |

---

## 📱 Future Mobile Roadmap
This web application is architected with headless RESTful APIs (`/api/v1/...`) and modular components, allowing a future React Native + Expo cross-platform app to consume the exact same backend, authentication, database, and business logic without code duplication.

---
*Built with excellence for Palm Heights Luxury Residences.*
