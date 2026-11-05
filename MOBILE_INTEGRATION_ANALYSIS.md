# Mobile Integration Analysis — Palm Heights Residences

## Executive Summary
This document provides a comprehensive technical analysis of the existing backend, database, authentication mechanisms, and REST APIs of the **Palm Heights Residences Apartment Management** system. The React Native + Expo Android mobile application shares the **exact same backend, database, business logic, and authentication infrastructure** as the existing Next.js web application.

---

## 1. Backend Architecture
* **Framework**: Next.js 14.2 (App Router) with full RESTful API layer under `/api/v1/...`.
* **Database & ORM**: PostgreSQL / SQLite via Prisma ORM (`prisma/schema.prisma`).
* **Authentication**: JSON Web Tokens (JWT) using `HS256` signed with `JWT_SECRET`. Tokens are transported via:
  - Header: `Authorization: Bearer <token>`
  - Cookie: `token=<jwt>` (httpOnly)
  - Mobile compatibility: Mobile app transmits `Authorization: Bearer <token>` in Axios/Fetch request interceptors stored securely using `expo-secure-store`.
* **Password Hashing**: `bcryptjs` with salt rounds = 10.
* **Server Port**: Currently active on `http://localhost:3000` (or `http://localhost:3001`). For Android mobile physical device/cloud build access, an HTTPS production API base URL or tunnel endpoint is utilized.

---

## 2. User Roles & Permission Matrix

The backend enforces four distinct roles (`User.role`):

| Role | Access Scope | Key Mobile Capabilities |
| :--- | :--- | :--- |
| **`RESIDENT`** | Community Resident | Browse services, search, book providers, track requests (`Requested` → `Reviewed`), rate/review completed jobs, post domestic requirements (Feature 5), manage applicants, chat privately. |
| **`PROVIDER`** | Verified Service Specialist | Profile & verification document submission, multi-step service listing creation (`Apartment Only`), incoming booking acceptance/rejection (mandatory reason), job completion with photo, revenue summary. |
| **`MANAGEMENT`** | Society Estate Office | Society overview, notices management, provider verification oversight, gate access tracking. |
| **`ADMIN`** | Platform Administrator | Full platform control, provider document inspection & badge verification, listing approvals, moderation queue, dynamic category CRUD. |

---

## 3. Database Entity Relationships (Prisma Models)

The normalized database consists of 21 models:
* `User`: Base identity (email, passwordHash, role, phone, avatar, isVerified).
* `Community`: Society profile (name, code, blocks, flats, heroImage, notices).
* `CommunityMember`: Flat mapping (tower/block, flatNumber, residentType: OWNER/TENANT).
* `ResidentProfile`: Resident metadata (intercomNumber, familyMembersCount).
* `ProviderProfile`: Provider business profile (businessName, rating, reviewCount, completedJobsCount, startingPrice, availableToday, verificationStatus).
* `ProviderDocument`: Verification files (Aadhaar, Police clearance, licenses).
* `Category` & `SubCategory`: Dynamic 6 service groups with badges (`LAUNCHED`, `LAUNCHING_NOW`, `COMING_SOON`).
* `ServiceListing`: Service listings posted by providers with pricing type (`FIXED`, `STARTING_PRICE`, `HOURLY`, `PER_VISIT`).
* `ServiceAvailability`: Weekly schedule slots (Monday–Saturday 09:00–19:00).
* `ServiceRequest`: Service booking orders (`REQ-2026-XXXX`).
* `RequestStatusHistory`: Audit log of lifecycle transitions.
* `Requirement` & `RequirementApplication`: **Feature 5** domestic hiring hub (Cook, Maid, Driver, Housekeeping, Security).
* `Conversation` & `Message`: In-app messaging engine enforcing zero phone number exposure.
* `Review`: Verified 5-star reviews (restricted to `COMPLETED` requests, privacy-safe display: first name + block only).
* `Notification` & `NotificationPreference`: In-app and push notifications.
* `Report` & `AdminApproval`: Society moderation records.

---

## 4. REST API Endpoint Specifications

All endpoints are versioned under `/api/v1/`.

### 4.1 Authentication & Profile
* **`POST /api/v1/auth/login`**
  - **Request**: `{ "email": "rahul.sharma@gmail.com", "password": "Password123!" }`
  - **Response**: `{ "success": true, "token": "jwt...", "user": { "id", "email", "name", "role", "isVerified", ... } }`
* **`GET /api/v1/auth/me`**
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: `{ "authenticated": true, "user": { ... } }`
* **`POST /api/v1/auth/register`**
  - **Request**: `{ "name", "email", "password", "phone", "role": "RESIDENT" | "PROVIDER", "block", "flatNumber", ... }`
  - **Response**: `{ "success": true, "token", "user" }`
* **`POST /api/v1/auth/switch-role`**
  - **Request**: `{ "role": "RESIDENT" | "PROVIDER" | "MANAGEMENT" | "ADMIN" }`
  - **Response**: Instant demo persona token switch for rapid testing.
* **`POST /api/v1/auth/logout`**
  - **Response**: `{ "success": true }`

### 4.2 Categories & Discovery
* **`GET /api/v1/categories`**
  - **Response**: List of 6 primary category groups with dynamic subcategories, launch status, and listing counts.
* **`GET /api/v1/categories/[slug]`**
  - **Response**: Category details with subcategories and published provider listings.

### 4.3 Service Providers & Listings
* **`GET /api/v1/providers`**
  - **Query Params**: `category`, `subcategory`, `verifiedOnly`, `availableToday`, `minRating`, `maxPrice`, `sortBy` (`rating` | `price_asc` | `jobs_desc`).
  - **Response**: `{ "success": true, "count": N, "providers": [ ... ] }`
  - **Privacy Guarantee**: Provider phone numbers are strictly excluded from output payloads.
* **`GET /api/v1/providers/[id]`**
  - **Response**: Detailed profile with rating breakdown (5★ to 1★ counts), availability schedule, before-and-after work photos, and privacy-protected customer reviews (`reviewerFirstName`, `reviewerBlock`).
* **`GET /api/v1/services`**
  - **Query Params**: `q`, `categoryId`, `status`
  - **Response**: Filtered service catalog listings.
* **`POST /api/v1/services`**
  - **Headers**: `Authorization: Bearer <token>` (Provider only)
  - **Request**: `{ "categoryId", "subCategoryId", "title", "description", "priceType", "price", "photosJson" }`
  - **Behavior**: Auto-assigned `status: "PENDING_APPROVAL"`, `visibility: "APARTMENT_ONLY"`.

### 4.4 Service Requests & Lifecycle
* **`GET /api/v1/requests`**
  - **Headers**: `Authorization: Bearer <token>`
  - **Behavior**: Residents receive their requests; Providers receive incoming/assigned jobs.
* **`POST /api/v1/requests`**
  - **Headers**: `Authorization: Bearer <token>`
  - **Request**: `{ "providerProfileId", "categoryName", "subCategoryName", "preferredDate", "preferredTimeSlot", "block", "flatNumber", "problemDescription", "photosJson", "additionalMessage" }`
  - **Response**: `{ "success": true, "requestNumber": "REQ-2026-XXXX", "request": { ... } }`
* **`PATCH /api/v1/requests/[id]`**
  - **Request**: `{ "status": "ACCEPTED" | "VISIT_SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "REJECTED" | "CANCELLED", "reason", "completionPhoto", "completionNotes" }`
  - **Validation**: Enforces strict state machine. Rejections and cancellations require a mandatory non-empty reason.

### 4.5 Customer Reviews
* **`POST /api/v1/reviews`**
  - **Headers**: `Authorization: Bearer <token>`
  - **Request**: `{ "serviceRequestId", "rating": 1-5, "comment", "photoUrl" }`
  - **Validation**: Only completed requests can receive reviews. Automatically extracts first name and tower block for anonymous display.

### 4.6 Feature 5: Domestic Hiring Requirements
* **`GET /api/v1/requirements`**
  - **Query Params**: `category` (COOK, MAID, HOUSEKEEPING, DRIVER, SECURITY, OTHER), `scheduleType`, `status`, `mine`.
  - **Response**: List of community domestic staffing openings.
* **`POST /api/v1/requirements`**
  - **Request**: `{ "category", "roleTitle", "scheduleType", "duration", "payRangeMin", "payRangeMax", "payPeriod", "preferredStartTime", "description" }`
  - **Response**: `{ "success": true, "requirement": { ... } }`
* **`GET /api/v1/requirements/[id]`**
  - **Response**: Details and list of candidate applications.
* **`POST /api/v1/requirements/[id]/apply`**
  - **Request**: `{ "coverNote", "expectedPay", "experience", "applicantRole" }`
* **`PATCH /api/v1/requirements/[id]`**
  - **Request**: `{ "applicationId", "action": "SHORTLIST" | "SELECT" | "REJECT" }`
  - **Behavior**: Selecting an applicant marks the requirement as `FILLED`.

### 4.7 In-App Messaging
* **`GET /api/v1/conversations`**: Lists active chat threads.
* **`POST /api/v1/conversations`**: Initiates or retrieves an existing conversation thread with another user.
* **`GET /api/v1/conversations/[id]/messages`**: Message history.
* **`POST /api/v1/conversations/[id]/messages`**: `{ "content": "..." }`.

### 4.8 Notifications & Admin Approvals
* **`GET /api/v1/notifications`**: List user notifications + unread count.
* **`PATCH /api/v1/notifications`**: `{ "markAllRead": true }` or preference toggles.
* **`GET /api/v1/admin/approvals`**: Admin queue for pending providers, listings, and reports.
* **`POST /api/v1/admin/approvals`**: `{ "targetType", "targetId", "action": "APPROVE" | "REJECT", "reason" }`.
* **`POST /api/v1/reports`**: Submit moderation flag.

---

## 5. Security & Mobile Compliance
1. **Zero Phone Leakage**: Phone numbers are completely hidden from client responses. All coordination runs through authenticated in-app chat.
2. **Session Persistence**: JWT stored securely in `expo-secure-store` on device.
3. **Network Architecture**: Mobile app targets the production API over HTTPS. All backend validation is strictly preserved.
