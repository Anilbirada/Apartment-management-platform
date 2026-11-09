# Palm Heights Enterprise SaaS: Role-to-Feature Permission Matrix

**Document Reference**: QA-RTM-2026-V1  
**Auditor**: Lead Security & QA Engineer  
**Coverage**: All 6 User Roles across 22 System Modules & Operations  

---

## Permission Legend
- **`ALLOW`**: Full authorized access and operational execution.
- **`SCOPED`**: Authorized strictly within assigned tenancy (e.g. own apartment or own listings).
- **`VIEW_ONLY`**: Read-only display of public/approved information.
- **`DENIED (403)`**: Explicitly barred by API authorization / edge middleware with 403 Forbidden.
- **`REDIRECT (302)`**: Redirected to user's authorized dashboard by Edge Route Guard.

---

## Role-to-Module Access Matrix

| Module / Operation | GUEST | RESIDENT | SERVICE_PROVIDER | LOCAL_BUSINESS | SOCIETY_MANAGEMENT | PLATFORM_ADMIN |
|---|---|---|---|---|---|---|
| **Public Homepage (`/`)** | `ALLOW` | `ALLOW` | `ALLOW` | `ALLOW` | `ALLOW` | `ALLOW` |
| **Login (`/login`)** | `ALLOW` | `ALLOW` | `ALLOW` | `ALLOW` | `ALLOW` | `ALLOW` |
| **Self-Registration (`/register`)** | `ALLOW` | `ALLOW` | `DENIED (Login)` | `DENIED (Login)` | `DENIED (Login)` | `DENIED (Login)` |
| **Designated Dashboard Route** | `/guest/dashboard` | `/resident/dashboard` | `/provider/dashboard` | `/business/dashboard` | `/management/dashboard` | `/admin/dashboard` |
| **Guest Dashboard (`/guest/dashboard`)** | `ALLOW` | `REDIRECT (302)` | `REDIRECT (302)` | `REDIRECT (302)` | `REDIRECT (302)` | `ALLOW` |
| **Resident Dashboard (`/resident/dashboard`)** | `REDIRECT (302)` | `ALLOW` | `REDIRECT (302)` | `REDIRECT (302)` | `REDIRECT (302)` | `ALLOW` |
| **Provider Dashboard (`/provider/dashboard`)** | `REDIRECT (302)` | `REDIRECT (302)` | `ALLOW` | `REDIRECT (302)` | `REDIRECT (302)` | `ALLOW` |
| **Business Dashboard (`/business/dashboard`)** | `REDIRECT (302)` | `REDIRECT (302)` | `REDIRECT (302)` | `ALLOW` | `REDIRECT (302)` | `ALLOW` |
| **Management Dashboard (`/management/dashboard`)** | `REDIRECT (302)` | `REDIRECT (302)` | `REDIRECT (302)` | `REDIRECT (302)` | `SCOPED` | `ALLOW` |
| **Admin Dashboard (`/admin/dashboard`)** | `REDIRECT (302)` | `REDIRECT (302)` | `REDIRECT (302)` | `REDIRECT (302)` | `REDIRECT (302)` | `ALLOW` |
| **Browse Services (`/services`)** | `ALLOW` | `ALLOW` | `ALLOW` | `ALLOW` | `ALLOW` | `ALLOW` |
| **Book Doorstep Service** | `DENIED (Verify)` | `ALLOW` | `DENIED` | `DENIED` | `DENIED` | `ALLOW (Test)` |
| **Post Service Listing** | `DENIED (403)` | `DENIED (403)` | `ALLOW` | `DENIED (403)` | `DENIED (403)` | `ALLOW` |
| **Browse Businesses (`/businesses`)** | `ALLOW` | `ALLOW` | `ALLOW` | `ALLOW` | `ALLOW` | `ALLOW` |
| **Launch Advertising Campaign** | `DENIED (403)` | `DENIED (403)` | `DENIED (403)` | `ALLOW` | `DENIED (403)` | `ALLOW` |
| **Soft Delete Campaign** | `DENIED (403)` | `DENIED (403)` | `DENIED (403)` | `SCOPED (Own)` | `DENIED (403)` | `ALLOW` |
| **Resident Directory Management** | `DENIED (403)` | `DENIED (403)` | `DENIED (403)` | `DENIED (403)` | `SCOPED (Own Apt)`| `ALLOW` |
| **Approve Resident Applications** | `DENIED (403)` | `DENIED (403)` | `DENIED (403)` | `DENIED (403)` | `SCOPED (Own Apt)`| `ALLOW` |
| **QR Gate Attendance Monitoring** | `DENIED (403)` | `VIEW_ONLY (Own)`| `ALLOW (Scan)` | `DENIED (403)` | `SCOPED (Own Apt)`| `ALLOW` |
| **Create Apartment Community** | `DENIED (403)` | `DENIED (403)` | `DENIED (403)` | `DENIED (403)` | `DENIED (403)` | `ALLOW` |
| **Assign Membership Tiers** | `DENIED (403)` | `DENIED (403)` | `DENIED (403)` | `DENIED (403)` | `DENIED (403)` | `ALLOW` |
| **Review Role Upgrade Applications** | `DENIED (403)` | `DENIED (403)` | `DENIED (403)` | `DENIED (403)` | `DENIED (403)` | `ALLOW` |
| **Monetization & Revenue Ledger** | `DENIED (403)` | `DENIED (403)` | `DENIED (403)` | `DENIED (403)` | `DENIED (403)` | `ALLOW` |
| **Role Switch API (`/switch-role`)**| `DENIED (403)` | `DENIED (403)` | `DENIED (403)` | `DENIED (403)` | `DENIED (403)` | `ALLOW` |
| **In-App Messaging** | `DENIED` | `ALLOW` | `ALLOW` | `ALLOW` | `ALLOW` | `ALLOW` |
| **Post Helper Requirements** | `DENIED` | `ALLOW` | `DENIED` | `DENIED` | `DENIED` | `ALLOW` |
| **Apply for Helper Requirements** | `DENIED` | `DENIED` | `ALLOW` | `DENIED` | `DENIED` | `ALLOW` |

---

## Multi-Apartment Isolation Verification

| Action Attempted | Persona | Target Asset | Result | Audit Status |
|---|---|---|---|---|
| Query residents of Apartment B | Manager of Apartment A | `/api/v1/apartments/B/residents` | **403 Forbidden** | ✅ Isolated |
| Approve applicant in Apartment B | Manager of Apartment A | `/api/v1/apartments/B/applications/X` | **403 Forbidden** | ✅ Isolated |
| Query gates/visits in Apartment B | Manager of Apartment A | `/api/v1/provider-visits?communityId=B` | **403 Forbidden** | ✅ Isolated |
| Query private resident notices of B| Resident of Apartment A | `/resident/dashboard` | **Scoped to A** | ✅ Isolated |
| Global apartment overview | Platform Administrator | All Apartments | **200 OK (Global)** | ✅ Authorized |
