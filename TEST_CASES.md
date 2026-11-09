# Palm Heights Enterprise SaaS: Comprehensive Test Case Specification

**Document Reference**: QA-TC-2026-V1  
**Total Test Cases Defined**: 92  
**Test Suite**: Palm Heights Quality Assurance Suite  

---

## 1. Authentication & Session Management (TC-AUTH)

| TC ID | Test Case Title | Preconditions | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| **TC-AUTH-01** | Guest Self-Registration | Public visitor on `/register` | Fill name, email, phone, password; select Guest role; submit | User created with `role: GUEST`, `status: ACTIVE`, redirected to `/guest/dashboard` | P1 |
| **TC-AUTH-02** | Resident Self-Registration | Public visitor on `/register` | Fill resident form, select apartment, block, flat; submit | User created with `role: RESIDENT`, application created as `PENDING`, awaiting approval | P1 |
| **TC-AUTH-03** | Email + Password Login | Registered active user | Navigate to `/login`, enter valid email & password; click Login | 200 OK, HTTP-only JWT cookie set, redirected to user's designated dashboard | P0 |
| **TC-AUTH-04** | Phone + Password Login | Registered active user | Navigate to `/login`, enter valid mobile number & password; click Login | 200 OK, JWT cookie set, redirected to designated dashboard | P0 |
| **TC-AUTH-05** | Phone Number Normalization | User enters 10-digit phone | Login with `9876543210` or `+919876543210` | Both formats resolve to identical normalized `+919876543210` record | P2 |
| **TC-AUTH-06** | Invalid Password Attempt | Registered user | Enter valid email and incorrect password | 401 Unauthorized, message "Invalid credentials", token not set | P1 |
| **TC-AUTH-07** | Non-Existent User Login | Unregistered user | Enter unseeded email and password | 401 Unauthorized, message "Invalid credentials" | P1 |
| **TC-AUTH-08** | Duplicate Email Registration | Email already exists in DB | Attempt to register new user with existing email | 400 Bad Request, message "An account with this email already exists" | P1 |
| **TC-AUTH-09** | Duplicate Phone Registration | Phone already exists in DB | Attempt to register new user with existing phone | 400 Bad Request, message "An account with this phone already exists" | P1 |
| **TC-AUTH-10** | Suspended User Login | User has `status: SUSPENDED` | Attempt login with valid credentials | 403 Forbidden, message "Your account has been suspended" | P1 |
| **TC-AUTH-11** | Session Persistence on Refresh | Authenticated user | Log in, navigate to dashboard, press F5 / reload | Session persists via JWT cookie, user remains authenticated | P1 |
| **TC-AUTH-12** | User Logout Execution | Authenticated user | Click profile menu -> Logout | JWT cookie cleared (`Max-Age=0`), redirected to `/login` | P1 |
| **TC-AUTH-13** | Protected Route Guard after Logout | Logged out user | Navigate directly to `/resident/dashboard` or `/admin/dashboard` | Edge middleware intercepts, returns 302 redirect to `/login?redirect=...` | P0 |
| **TC-AUTH-14** | Role Tampering via Cookie/Headers | Malicious resident | Tamper with payload role to `PLATFORM_ADMIN` with invalid signature | JWT verification fails (signature invalid), session rejected (302 to `/login`) | P0 |
| **TC-AUTH-15** | Role Switch API Authorization | Non-admin user | Send POST to `/api/v1/auth/switch-role` | 403 Forbidden, only PLATFORM_ADMIN can switch roles | P1 |

---

## 2. Role-Based Navigation & Dashboard Redirection (TC-ROLE)

| TC ID | Test Case Title | Role | Route Tested | Expected Result | Priority |
|---|---|---|---|---|---|
| **TC-ROLE-01** | Guest Dashboard Redirection | GUEST | `/login` | Redirects to `/guest/dashboard` | P0 |
| **TC-ROLE-02** | Resident Dashboard Redirection | RESIDENT | `/login` | Redirects to `/resident/dashboard` | P0 |
| **TC-ROLE-03** | Service Provider Redirection | SERVICE_PROVIDER | `/login` | Redirects to `/provider/dashboard` | P0 |
| **TC-ROLE-04** | Society Management Redirection | SOCIETY_MANAGEMENT | `/login` | Redirects to `/management/dashboard` | P0 |
| **TC-ROLE-05** | Local Business Redirection | LOCAL_BUSINESS | `/login` | Redirects to `/business/dashboard` | P0 |
| **TC-ROLE-06** | Platform Admin Redirection | PLATFORM_ADMIN | `/login` | Redirects to `/admin/dashboard` | P0 |
| **TC-ROLE-07** | Resident Access to Admin Route | RESIDENT | `/admin/dashboard` | 302 Redirect to `/resident/dashboard` (Access Denied) | P0 |
| **TC-ROLE-08** | Guest Access to Provider Route | GUEST | `/provider/dashboard` | 302 Redirect to `/guest/dashboard` (Access Denied) | P0 |
| **TC-ROLE-09** | Navigation Menu Persona Scope | All Roles | Desktop & Mobile Nav | Menu displays strictly authorized links for the user's canonical role | P1 |
| **TC-ROLE-10** | Brand Logo Click Navigation | All Roles | Navbar Logo | Authenticated user clicking logo is routed to their own dashboard | P2 |

---

## 3. Public Website & Guest Marketplace Access Control (TC-PUB)

| TC ID | Test Case Title | Persona | Action | Expected Result | Priority |
|---|---|---|---|---|---|
| **TC-PUB-01** | Public Homepage Accessibility | Unauthenticated Visitor | Open `http://localhost:3000` | Homepage renders with hero, apartments, businesses, and testimonials | P1 |
| **TC-PUB-02** | Public Exploration of Communities | Unauthenticated Visitor | View apartment showcase on homepage | Displays public community name, city, flats; hides private tenant data | P1 |
| **TC-PUB-03** | Public Exploration of Businesses | Unauthenticated Visitor | View neighborhood businesses section | Displays business name, category, city; hides owner contact | P1 |
| **TC-PUB-04** | Restricted Services Access | Unauthenticated Visitor | Click "Services" or `/services` | Redirected to `/login?redirect=/services`, prompt to login displayed | P0 |
| **TC-PUB-05** | Restricted Businesses Access | Unauthenticated Visitor | Click "Local Businesses" or `/businesses` | Redirected to `/login?redirect=/businesses`, prompt to login displayed | P0 |
| **TC-PUB-06** | Restricted Provider Profile Access | Unauthenticated Visitor | Open `/providers/[id]` | Redirected to `/login`, direct provider details blocked | P1 |
| **TC-PUB-07** | Guest Marketplace Browsing | Authenticated GUEST | Open `/services` and `/businesses` | Successfully loads services and businesses catalog | P1 |
| **TC-PUB-08** | Guest Booking Attempt | Authenticated GUEST | Attempt to book a service request | Prompted to complete resident/upgrade verification before booking | P2 |

---

## 4. Guest Role Upgrade Workflows (TC-UPG)

| TC ID | Test Case Title | Steps | Expected Result | Priority |
|---|---|---|---|---|
| **TC-UPG-01** | Guest Applies to Provider | Guest submits upgrade form with category & trade docs | Application created with status `PENDING_REVIEW`, visible in admin queue | P1 |
| **TC-UPG-02** | Admin Approves Provider Upgrade | Admin reviews application on `/admin/upgrades`, approves with notes | User role updated to `PROVIDER`, provider profile created, tier assigned | P1 |
| **TC-UPG-03** | Guest Applies to Local Business | Guest submits business name, category, registration details | Application created with status `PENDING_REVIEW`, documents attached | P1 |
| **TC-UPG-04** | Admin Approves Business Upgrade | Admin approves business application | User role updated to `BUSINESS`, business profile created with `status: ACTIVE` | P1 |
| **TC-UPG-05** | Guest Applies to Management | Guest submits management application with community selection | Application recorded with target community | P1 |
| **TC-UPG-06** | Admin Approves Management Upgrade | Admin approves management application | User role updated to `MANAGEMENT`, `communityId` assigned | P1 |
| **TC-UPG-07** | Rejection with Mandatory Reason | Admin rejects application without notes | API rejects with 400 Bad Request requiring rejection reason | P1 |
| **TC-UPG-08** | Duplicate Upgrade Prevention | Guest with active pending application attempts another | Prevented with message "An application is already pending review" | P2 |

---

## 5. Multi-Apartment & Tenant Isolation (TC-APT)

| TC ID | Test Case Title | Scenario | Expected Result | Priority |
|---|---|---|---|---|
| **TC-APT-01** | Admin Creates Apartment Community | Admin posts to `/api/v1/apartments` | Community created with code, blocks, total flats, and initial gate | P1 |
| **TC-APT-02** | Society Management Scoped Access | Manager queries `/api/v1/apartments/[id]/residents` for own apartment | Returns resident list for manager's assigned apartment | P1 |
| **TC-APT-03** | Cross-Apartment Resident Query (IDOR) | Manager of Apartment A queries residents of Apartment B | 403 Forbidden, tenant isolation strictly enforced | P0 |
| **TC-APT-04** | Resident Application Approval | Manager approves pending resident application in own apartment | Resident application marked `APPROVED`, member unit assigned | P1 |
| **TC-APT-05** | Cross-Apartment Application Tampering | Manager of Apartment A attempts to approve applicant of Apartment B | 403 Forbidden, rejected by tenant boundary guard | P0 |
| **TC-APT-06** | Block and Unit Capacity Tracking | Query apartment units | Units belong strictly to parent block; unique unit numbers enforced | P2 |
| **TC-APT-07** | Management Invitation Option 1 | Management sends resident invite with email & token | `ResidentInvitation` created with secure token and expiration date | P2 |
| **TC-APT-08** | Resident Self-Registration Option 2 | Resident selects apartment, unit, submits proof | Application queued in management dashboard for approval | P1 |

---

## 6. Local Service Providers & Tier Ranking (TC-PROV & TC-TIER)

| TC ID | Test Case Title | Steps | Expected Result | Priority |
|---|---|---|---|---|
| **TC-PROV-01** | Provider Service Area Linking | Provider adds locality and pin code coverage | `ProviderServiceArea` record created and linked to profile | P1 |
| **TC-PROV-02** | Location-Based Provider Filtering | Resident searches providers for specific community | Results only include providers serving that community/locality | P1 |
| **TC-PROV-03** | Non-Covered Locality Exclusion | Resident searches providers in non-serviced pin code | Provider is excluded from search results | P2 |
| **TC-TIER-01** | Default Tier Allocation | New provider or business approved | Defaults to `BRONZE` tier with `tierStatus: ACTIVE` | P1 |
| **TC-TIER-02** | Admin Tier Upgrade to Gold | Admin sets provider tier to `GOLD` | Tier updated, `MembershipTierAudit` record created | P1 |
| **TC-TIER-03** | Search Ranking by Tier Hierarchy | Search providers in category | `GOLD` providers appear first, followed by `SILVER`, then `BRONZE` | P0 |
| **TC-TIER-04** | Secondary Ranking within Same Tier | Multiple providers in same tier | Ranked secondarily by rating and completed jobs count | P2 |
| **TC-TIER-05** | Non-Admin Tier Tamper Attempt | Provider sends POST to `/api/v1/admin/memberships` | 403 Forbidden, only PLATFORM_ADMIN can modify tiers | P0 |

---

## 7. Local Business & Advertising Campaigns (TC-BIZ & TC-IMG)

| TC ID | Test Case Title | Steps | Expected Result | Priority |
|---|---|---|---|---|
| **TC-BIZ-01** | Business Profile Registration | Business user completes profile with category & address | Profile created with `status: ACTIVE` | P1 |
| **TC-IMG-01** | Valid Campaign Image Upload (PNG) | Upload valid 1MB PNG file to `/api/v1/uploads` | 200 OK, returns persistent URL `/uploads/img-...png`, file saved to disk | P1 |
| **TC-IMG-02** | Valid Campaign Image Upload (WebP) | Upload valid 800KB WebP file | 200 OK, persistent WebP stored | P2 |
| **TC-IMG-03** | Invalid File Format Upload (EXE/PDF) | Upload `.exe` or `.pdf` to `/api/v1/uploads` | 400 Bad Request, message "Only JPG, PNG and WebP files are allowed" | P0 |
| **TC-IMG-04** | Oversized File Upload (>5MB) | Upload 8MB image | 400 Bad Request, message "File size exceeds 5MB limit" | P1 |
| **TC-BIZ-02** | Launch Advertising Campaign | Business posts campaign with uploaded image reference | Campaign created with status `PENDING_APPROVAL` | P1 |
| **TC-BIZ-03** | Admin Approves Campaign | Admin reviews campaign, sets to `APPROVED` | Campaign becomes eligible for active community feed | P1 |
| **TC-BIZ-04** | Campaign Soft Deletion | Business deletes active campaign with reason | Campaign marked `deletedAt: now()`, `CampaignAuditLog` recorded | P1 |
| **TC-BIZ-05** | Feed Removal after Deletion | Query active campaigns for resident feed | Soft-deleted campaign is excluded from resident feed | P1 |
| **TC-BIZ-06** | Historical Transaction Preservation | Check payments linked to deleted campaign | Payment records and revenue ledger remain 100% intact | P1 |

---

## 8. QR Provider Entry & Exit Attendance (TC-QR)

| TC ID | Test Case Title | Scenario | Expected Result | Priority |
|---|---|---|---|---|
| **TC-QR-01** | Valid Entry QR Generation | Scheduled service request generates entry gate QR | HMAC signed token generated with gate ID and 15-minute expiration | P1 |
| **TC-QR-02** | Successful Entry Scan | Guard scans valid QR at apartment gate | `entryTimestamp` recorded, `visitStatus: INSIDE_APARTMENT` | P0 |
| **TC-QR-03** | Successful Exit Scan | Guard scans exit QR upon provider completion | `exitTimestamp` recorded, `visitStatus: EXITED`, `durationMinutes` computed | P0 |
| **TC-QR-04** | Expired QR Rejection | Scan QR token older than expiry threshold | 400 Bad Request, message "QR token has expired" | P1 |
| **TC-QR-05** | Tampered QR Token Rejection | Scan QR with modified signature or payload | 400 Bad Request, HMAC signature verification fails | P0 |
| **TC-QR-06** | Exit Without Entry Rejection | Attempt exit scan on visit not in `INSIDE_APARTMENT` state | 400 Bad Request, "Cannot exit without valid entry" | P1 |
| **TC-QR-07** | Duplicate Entry Rejection | Replay same entry QR token after entry recorded | 400 Bad Request, visit already active | P1 |
| **TC-QR-08** | Management Manual Correction | Society management corrects erroneous timestamp with reason | Timestamp updated, `isManualCorrection: true`, audit log recorded | P2 |

---

## 9. Subscriptions & Payment Monetization (TC-PAY)

| TC ID | Test Case Title | Steps | Expected Result | Priority |
|---|---|---|---|---|
| **TC-PAY-01** | Free Membership Allocation | Assign free plan to new provider | Subscription created with `status: ACTIVE`, price INR 0 | P1 |
| **TC-PAY-02** | Paid Subscription Initiation | User selects Gold/Silver plan, initiates payment | Transaction created with `status: PENDING`, payment gateway ref returned | P1 |
| **TC-PAY-03** | Sandbox Payment Verification | Payment gateway callback with valid HMAC signature | Transaction marked `SUCCESS`, subscription marked `ACTIVE` | P0 |
| **TC-PAY-04** | Invalid Payment Signature Rejection | Webhook sent with forged signature | 400 Bad Request, transaction rejected, subscription not activated | P0 |
| **TC-PAY-05** | Idempotent Payment Webhook | Duplicate webhook received for already successful TXN | Idempotent 200 OK returned without creating duplicate subscriptions | P1 |
| **TC-PAY-06** | Platform Monetization KPI Query | Admin views revenue analytics | Aggregates actual transaction sums from DB matching payments ledger | P2 |

---

## 10. Marketplace Core Workflows (TC-MKT)

| TC ID | Test Case Title | Steps | Expected Result | Priority |
|---|---|---|---|---|
| **TC-MKT-01** | Resident Books Service | Resident submits doorstep service request | Request created with `status: REQUESTED`, request number generated | P1 |
| **TC-MKT-02** | Provider Accepts Request | Provider updates status to `ACCEPTED` | Status updated, resident notified, scheduled visit created | P1 |
| **TC-MKT-03** | Provider Completes Service | Provider marks request `COMPLETED` | Request marked completed, review opportunity opened for resident | P1 |
| **TC-MKT-04** | Resident Review Submission | Resident submits rating & review for completed job | Review created, provider rating recalculated | P1 |
| **TC-MKT-05** | Reviewer Privacy Masking | Resident submits review | First name and block displayed only; full name and unit hidden | P1 |
| **TC-MKT-06** | Review Incomplete Job Rejection | Attempt review on `REQUESTED` service | 400 Bad Request, cannot review incomplete service | P1 |
| **TC-MKT-07** | Post Helper Requirement | Resident posts domestic helper requirement | Requirement created with category, salary, timing, status `OPEN` | P2 |
| **TC-MKT-08** | In-App Direct Messaging | Resident and provider exchange messages | Message persisted in conversation thread, unread count tracked | P2 |
