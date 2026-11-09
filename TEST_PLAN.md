# Palm Heights Enterprise SaaS: Master Test Plan (QA-TP-2026)

**Document Reference**: QA-TP-2026-V1  
**Project**: Palm Heights Enterprise Apartment Management & Community Marketplace  
**Version**: 3.0 Production Release  
**Author**: Lead QA Architect & Automation Test Engineer  
**Date**: November 6, 2026  

---

## 1. Scope of Testing

### In-Scope
1. **Authentication & Identity**: Registration, multi-credential login (email/phone), OTP verification, password hashing, session management, logout, suspended accounts, and role tampering protection.
2. **Six Account Personas**: Full end-to-end testing of `GUEST`, `RESIDENT`, `SERVICE_PROVIDER`, `SOCIETY_MANAGEMENT`, `LOCAL_BUSINESS`, and `PLATFORM_ADMIN`.
3. **Public Homepage vs. Authenticated Marketplace**: Unauthenticated visitor browsing, restriction barriers, login redirects, and friendly prompts.
4. **Guest Upgrade Applications**: Applications to Provider, Business, and Management, document upload, admin reviews, status tracking, notifications, and tier allocation.
5. **Multi-Apartment & Tenant Isolation**: Communities, blocks, flats, management scope isolation, IDOR protection, resident invitation vs. self-registration.
6. **Local Service Providers**: Service catalog, categories, subcategories, geographic coverage (`ProviderServiceArea`), availability, doorstep service booking, cancellation, completion, and rating privacy.
7. **Tier System (Gold / Silver / Bronze)**: Admin assignment, priority search ranking, badge indicators, and tier change audit logging.
8. **Local Businesses & Advertising Campaigns**: Business profile registration, campaign creation, file upload (JPG/PNG/WebP ≤ 5MB), image persistence, admin approval, soft deletion, and feed synchronization.
9. **QR Provider Entry & Exit Attendance**: Cryptographic HMAC signed QR tokens, expiry validation, entry/exit state transitions, duration calculation, and management audit log.
10. **Subscriptions & Monetization**: Free vs. paid subscription plans, transaction processing, idempotency, signature verification, and revenue analytics.
11. **Collaboration Features**: In-app messaging, helper requirements, and community announcements.
12. **Non-Functional Testing**: API robustness, database integrity, OWASP security checks, mobile responsiveness (390px to 1920px), performance, and TypeScript build validation.

### Out-of-Scope
- Real payment gateway fund transfers (Sandbox mock gateway and HMAC signature verification are used).
- Destructive load testing against third-party external networks.

---

## 2. Test Objectives

- Ensure 100% of the 6 account types access their designated dashboards without navigation leaks.
- Ensure 0 critical (P0) or high (P1) defects exist in the application.
- Validate that all 41 API endpoints enforce proper authentication, authorization, and schema validation.
- Verify multi-tenant isolation so no society management user can inspect or alter data of another apartment.
- Guarantee that all image uploads and database mutations persist across application restarts.
- Verify responsive layout integrity across 5 primary screen viewports.

---

## 3. Test Strategy & Methodologies

| Test Type | Objective | Tool / Framework |
|---|---|---|
| **E2E & Workflow Testing** | Validate multi-step user journeys from start to finish | Automated Node.js Runner + Browser Automation |
| **API Testing** | Test status codes, payloads, error responses, auth guards | Node fetch / HTTP client + REST Assertions |
| **Database & Integrity Testing** | Validate relations, foreign keys, constraints, and persistence | Prisma Client + SQLite Query Inspector |
| **Security & OWASP Testing** | Broken access control, IDOR, SQLi, XSS, token tampering | OWASP Top 10 Test Suite + Security Audit Scripts |
| **Responsive & UI/UX Testing** | Validate layouts at 390x844, 430x932, 768x1024, 1366x768, 1920x1080 | Headless Browser Viewport Emulation |
| **Performance Testing** | Measure page load times, API response latency, and DB queries | HTTP Benchmark & Performance Timing Suite |
| **Static Code & Type Check** | Zero compile errors, type safety, linting compliance | Next.js Compiler (`prisma generate && next build`) |

---

## 4. Test Environment & Configuration

- **Host OS**: Windows 11 Enterprise (x64)
- **Node.js**: v20.x
- **Application Server**: Next.js 14.2.35 on `http://localhost:3000`
- **Database**: SQLite `prisma/dev.db` via Prisma ORM 5.22.0
- **Storage**: Persistent disk folder `public/uploads/`
- **Secret Keys**: `JWT_SECRET`, `GATE_HMAC_SECRET`

---

## 5. Personas Under Test

| Role | Test Username | Test Email | Default Dashboard |
|---|---|---|---|
| **Guest** | Guest Tester | `guest@palmheights.internal` | `/guest/dashboard` |
| **Resident** | Resident Tester | `resident@palmheights.internal` | `/resident/dashboard` |
| **Service Provider** | Provider Tester | `provider@palmheights.internal` | `/provider/dashboard` |
| **Local Business** | Business Tester | `business@palmheights.internal` | `/business/dashboard` |
| **Society Management** | Manager Tester | `management@palmheights.internal` | `/management/dashboard` |
| **Platform Admin** | Admin Superuser | `admin@palmheights.internal` | `/admin/dashboard` |

---

## 6. Defect Severity & Priority Classification

| Severity Level | Definition | Response Expectation |
|---|---|---|
| **P0 - Critical** | Server crash, unhandled exception, data corruption, total auth failure | Fix immediately, block release |
| **P1 - High** | Core workflow broken, unauthorized access, privilege escalation, payment failure | Fix before sign-off |
| **P2 - Medium** | Non-critical feature failure, edge-case validation failure | Fix within current cycle |
| **P3 - Low** | Minor usability flaw, non-blocking UI anomaly | Document, address in cycle |
| **P4 - Cosmetic** | Alignment, typography, spacing inconsistency | Visual polish |

---

## 7. Acceptance Criteria for Release

1. **Test Pass Rate**: 100% of critical and high test cases must pass.
2. **Defect Status**: 0 open P0 and 0 open P1 defects.
3. **Build Status**: Clean production build with zero TypeScript and zero ESLint errors.
4. **Tenant Isolation**: 100% verified cross-apartment isolation.
5. **Documentation**: All 12 required QA artifacts completed and published.
