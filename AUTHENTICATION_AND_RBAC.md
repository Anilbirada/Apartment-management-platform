# AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)

**Project**: Enterprise Apartment Management & Local Business Marketplace SaaS  
**Version**: 2.0.0  
**Security Standard**: Enterprise Zero-Trust & Privacy-by-Design  

---

## 1. Five User Roles & Responsibilities

The platform enforces five distinct user roles with strict separation of concerns:

```
                      ┌───────────────────────────────────────────────┐
                      │            PLATFORM ADMINISTRATOR             │
                      │  (Master Multi-Tenant Governance & Billing)   │
                      └───────────────────────┬───────────────────────┘
                                              │
                     ┌────────────────────────┴────────────────────────┐
                     ▼                                                 ▼
     ┌───────────────────────────────┐                 ┌───────────────────────────────┐
     │      SOCIETY MANAGEMENT       │                 │       SERVICE PROVIDER        │
     │  (Isolated Apartment Campus)  │                 │ (Multi-Geographic Coverage)   │
     └───────────────┬───────────────┘                 └───────────────┬───────────────┘
                     │                                                 │
                     ▼                                                 ▼
     ┌───────────────────────────────┐                 ┌───────────────────────────────┐
     │      APARTMENT RESIDENT       │                 │        LOCAL BUSINESS         │
     │   (Services, Ads & Hiring)    │                 │ (Directory & Sponsored Ads)   │
     └───────────────────────────────┘                 └───────────────────────────────┘
```

| Role | Role Identifier | Primary Capabilities | Restricted Actions |
| :--- | :--- | :--- | :--- |
| **Apartment Resident** | `RESIDENT` | Browse services, post hiring requirements, book providers, rate jobs, chat privately, view free sponsored ads | Cannot access other residents' data; cannot access management or billing consoles |
| **Society Management** | `MANAGEMENT` | Manage apartment blocks, units, residents; review self-registration queues; monitor QR gate attendance; apply manual corrections | Strictly restricted to assigned apartment community; cannot view other societies |
| **Service Provider** | `PROVIDER` | Manage service listings, configure multiple geographic coverage areas/PINs, accept/decline bookings, scan gate QR codes, upgrade plans | Mobile phone never exposed to residents; cannot access resident private profiles or society settings |
| **Local Business** | `BUSINESS` | Manage business profile, create advertising campaigns, view impressions/clicks analytics, subscribe to merchant plans | Kept separate from service providers; no service booking permissions unless approved |
| **Platform Administrator**| `ADMIN` | Global control of all apartment master records, dynamic categories, monetization dashboards, approvals queue, system settings | Central SaaS authority with audit logging |

---

## 2. Global Identity & Credential Normalization

To prevent duplicate accounts and security impersonation vulnerabilities, the platform enforces strict normalization:

1. **Mobile Numbers (E.164 Standard)**:
   - All input phone numbers are sanitized and validated against standard E.164 international formatting (e.g. `+919845011223`).
   - Spaces, hyphens, and leading zeros are stripped.
   - Database enforces `@unique` constraint across the global `User` table.
2. **Email Addresses (Case-Insensitive Lowercase)**:
   - All emails are trimmed and converted to lowercase (e.g. `resident@palmheights.com`).
   - Database enforces `@unique` constraint across the global `User` table.
3. **Password Security**:
   - Passwords hashed using Bcrypt with a salt round factor of 10.
4. **Session Token**:
   - HTTP-Only, SameSite=Strict cookies prevent XSS and CSRF token interception.

---

## 3. Login & Authentication Workflows

### 3.1 Mobile Number + OTP Flow
1. **User enters mobile number**: E.164 formatted.
2. **OTP Dispatch**: Backend generates a secure 6-digit cryptographically random OTP with 5-minute TTL.
3. **Verification**: User inputs OTP. Backend checks rate limiting (maximum 3 attempts) and validates code.
4. **Session Issuance**: User is authenticated and redirected to their role-specific dashboard.

### 3.2 Email + Password Flow
1. **User enters email/phone and password**.
2. **Credential Check**: Password verified via Bcrypt compare.
3. **Session Issuance**: Redirects to active role dashboard.

### 3.3 Dynamic Role Switcher
Users possessing multiple authorizations (e.g., an Admin or Society Manager who is also a resident in the community) can seamlessly switch active contexts via the persona switcher in the navigation bar.

---

## 4. RBAC Permission Matrix

| Resource / Action | RESIDENT | PROVIDER | MANAGEMENT | BUSINESS | ADMIN |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **View Service Directory** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Sponsored Ads (100% Free)** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Book Service Request** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Post Domestic Hiring Requirement** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Manage Service Listings** | ❌ | ✅ | ❌ | ❌ | ✅ |
| **Configure Service Areas & PINs** | ❌ | ✅ | ❌ | ❌ | ✅ |
| **Scan Gate QR (Entry / Exit)** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Approve Resident Self-Registrations**| ❌ | ❌ | ✅ (Own Apt) | ❌ | ✅ (All) |
| **Generate Resident Invites** | ❌ | ❌ | ✅ (Own Apt) | ❌ | ✅ (All) |
| **Monitor Live Gate Attendance** | ❌ | ❌ | ✅ (Own Apt) | ❌ | ✅ (All) |
| **Apply Manual Gate Correction** | ❌ | ❌ | ✅ (With Log) | ❌ | ✅ (All) |
| **Create Advertising Campaigns** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Purchase Merchant/Provider Plan** | ❌ | ✅ | ❌ | ✅ | ❌ |
| **Platform Monetization Dashboard** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Create Apartment Master Records** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Dynamic Category Configuration** | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 5. Privacy & Zero Phone Leakage Guarantee

In strict compliance with commercial SaaS privacy standards:
1. **Provider Phone Numbers**: **Never exposed** in API payloads returned to residents (`select: { phone: false }`).
2. **Resident Phone Numbers**: **Never exposed** in provider booking views.
3. **Private In-App Messaging**: All customer-technician communications must strictly route through the end-to-end audit-logged `/api/v1/conversations` messaging channel.
4. **Reviews Privacy**: Resident reviews only expose the reviewer's first name and tower block (e.g. `Priya (Tower A)`), protecting flat numbers and private identities.
