# REST API SPECIFICATION & INTEGRATION GUIDE

**Project**: Enterprise Apartment Management & Local Business Marketplace SaaS  
**Version**: 2.0.0  
**Base URL**: `/api/v1`  
**Authentication**: HTTP-Only Secure Session Cookie (`app_session`) / Bearer Token  
**Content-Type**: `application/json`  

---

## 1. Authentication & Identity APIs

### 1.1 Send Mobile OTP
`POST /api/v1/auth/otp/send`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "phone": "+919845011223"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "OTP sent successfully",
    "expiresInSeconds": 300,
    "devOtp": "123456"
  }
  ```

### 1.2 Verify Mobile OTP & Login
`POST /api/v1/auth/otp/verify`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "phone": "+919845011223",
    "otp": "123456"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "token": "sess_jwt_token_here",
    "user": {
      "id": "usr_uuid",
      "name": "Rajesh Kumar",
      "phone": "+919845011223",
      "email": "rajesh@gmail.com",
      "role": "PROVIDER",
      "isVerified": true
    }
  }
  ```

### 1.3 Email / Phone Password Login
`POST /api/v1/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "identifier": "resident@palmheights.com",
    "password": "Password123!"
  }
  ```
- **Response** (200 OK): Returns user session and authorized dashboard role.

### 1.4 Three-Way Registration
`POST /api/v1/auth/register`
- **Access**: Public
- **Supported Registrations**:
  1. `RESIDENT`: Submits to society self-registration queue (`ResidentApplication`).
  2. `PROVIDER`: Registers provider profile and submits verification documents.
  3. `BUSINESS`: Registers merchant and creates local business record.
- **Request Body**:
  ```json
  {
    "name": "Kavita Nair",
    "email": "kavita@gmail.com",
    "phone": "+919877712345",
    "password": "Password123!",
    "role": "RESIDENT",
    "communityId": "comm_uuid",
    "block": "Tower B",
    "flatNumber": "B-302",
    "occupancyType": "TENANT",
    "proofDocumentUrl": "https://images.unsplash.com/doc.jpg"
  }
  ```

### 1.5 Switch Active Persona
`POST /api/v1/auth/switch-role`
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "role": "MANAGEMENT"
  }
  ```

---

## 2. Multi-Apartment Community APIs

### 2.1 List Communities
`GET /api/v1/apartments`
- **Access**: Public / Authenticated
- **Query Params**: `city`, `locality`, `pinCode`
- **Response** (200 OK): Returns active apartment communities list with unit and block counts.

### 2.2 Create Community (Platform Admin)
`POST /api/v1/apartments`
- **Access**: Admin only (`PLATFORM_ADMIN`)
- **Request Body**:
  ```json
  {
    "name": "Heights Horizon",
    "code": "HH-BLR-01",
    "city": "Bengaluru",
    "state": "Karnataka",
    "postalCode": "560066",
    "address": "Whitefield Main Road",
    "totalBlocks": 2,
    "totalFlats": 120,
    "onboardingMode": "BOTH"
  }
  ```

### 2.3 Community Blocks & Units Hierarchy
`GET /api/v1/apartments/{id}/blocks`
- **Access**: Authenticated
- **Response** (200 OK): Returns nested block list with floors and units.

`POST /api/v1/apartments/{id}/blocks`
- **Access**: Society Management / Platform Admin
- **Request Body**:
  ```json
  {
    "blockName": "Tower C",
    "totalFloors": 14,
    "units": [
      { "unitNumber": "101", "floor": 1, "occupancy": "VACANT" }
    ]
  }
  ```

### 2.4 Resident Self-Registration Approval Queue
`GET /api/v1/apartments/{id}/applications`
- **Access**: Society Management / Admin
- **Query Params**: `status` (PENDING, APPROVED, REJECTED)

`PATCH /api/v1/apartments/{id}/applications/{appId}`
- **Access**: Society Management / Admin
- **Request Body**:
  ```json
  {
    "action": "APPROVE",
    "reason": "Verified against physical rental lease agreement"
  }
  ```

---

## 3. Local Service Providers & Geographic Search APIs

### 3.1 Geographic Provider Discovery
`GET /api/v1/providers`
- **Access**: Public / Resident
- **Query Params**:
  - `category`: Category slug (e.g. `plumbing`)
  - `subcategory`: Subcategory slug (e.g. `pipe-leakage`)
  - `communityId`: Resident's apartment ID
  - `postalCode`: PIN code filter
  - `minRating`: Minimum average star rating
  - `verifiedOnly`: `true` to filter background-verified professionals
  - `availableToday`: `true` for same-day on-call service
  - `sortBy`: `rating` | `price_asc` | `jobs_desc`
- **Privacy Enforcement**: Returns provider profile with **zero exposure of private mobile phone numbers**. Public communications must route via `/api/v1/conversations`.

### 3.2 Provider Local Service Areas
`GET /api/v1/provider-service-areas`
- **Access**: Service Provider (`ROLE: PROVIDER`)
- **Response** (200 OK): Returns list of configured geographical service areas.

`POST /api/v1/provider-service-areas`
- **Access**: Service Provider
- **Request Body**:
  ```json
  {
    "locality": "HSR Layout",
    "postalCode": "560102",
    "serviceRadiusKm": 6.5
  }
  ```

`DELETE /api/v1/provider-service-areas?id={id}`
- **Access**: Service Provider

---

## 4. Local Business & Advertising APIs

### 4.1 Business Directory & Profile
`GET /api/v1/businesses`
- **Access**: Public / Resident
- **Query Params**: `category`, `locality`, `city`

`POST /api/v1/businesses`
- **Access**: Local Business Owner (`ROLE: BUSINESS`)
- **Request Body**: Registers or updates merchant store profile.

### 4.2 Persistent Image Upload API (Requirement 11)
`POST /api/v1/uploads`
- **Access**: Authenticated / Local Business Owner
- **Content-Type**: `multipart/form-data`
- **Payload**: `file` (Binary image file: JPG, JPEG, PNG, or WebP; maximum 5MB)
- **Validation**: Strict server-side MIME type check and byte size enforcement.
- **Storage**: Persisted to `public/uploads/campaigns/` with collision-safe unique filenames.
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "url": "/uploads/campaigns/1730788900-a1b2c3d4-banner.webp",
    "fileName": "banner.webp",
    "fileSize": 184520,
    "mimeType": "image/webp"
  }
  ```

### 4.3 Sponsored Campaigns (Resident Feed & Management)
`GET /api/v1/campaigns`
- **Access**: Public / Resident (100% Free for residents to view)
- **Query Params**:
  - `communityId`: Filter campaigns targeted to specific apartment
  - `category`: Filter by merchant category
  - `mine`: `true` to return calling business owner's campaigns
- **Filtering**: Strictly filters `status: "ACTIVE"` and `deletedAt: null`. Soft-deleted campaigns are immediately excluded.
- **Response** (200 OK): Returns active, approved sponsored advertisements.

`POST /api/v1/campaigns`
- **Access**: Local Business Owner (`ROLE: BUSINESS`)
- **Request Body**:
  ```json
  {
    "title": "Flat 25% Off Fresh Vegetables & Dairy",
    "description": "Exclusive neighborhood discount for Palm Heights residents on first 3 orders.",
    "bannerUrl": "/uploads/campaigns/1730788900-a1b2c3d4-banner.webp",
    "imageFileName": "banner.webp",
    "imageFileSize": 184520,
    "imageMimeType": "image/webp",
    "targetCategory": "GROCERY",
    "targetApartments": ["comm_uuid_1"],
    "startDate": "2026-11-03",
    "endDate": "2026-11-17"
  }
  ```

`DELETE /api/v1/campaigns/{id}` (Requirement 12: Soft Deletion)
- **Access**: Authenticated Business Owner (must own the campaign) or Platform Admin
- **Request Body**:
  ```json
  {
    "reason": "Promotion ended early due to sold out inventory."
  }
  ```
- **Ownership Verification**: Returns `403 Forbidden` if business owner attempts to delete another merchant's promotion.
- **Soft Deletion Semantics**:
  - Updates campaign record with `status: "DELETED"`, `deletedAt: timestamp`, `deletedById: user.id`, `deletionReason: reason`.
  - Immediately stops display to residents in real-time.
  - Automatically writes an entry in `CampaignAuditLog` preserving impressions, clicks, and deletion context.
  - Preserves all associated subscription payments, tax invoices, and accounting history.
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Campaign soft deleted successfully and removed from resident feeds.",
    "campaignId": "camp_uuid"
  }
  ```

`PATCH /api/v1/campaigns/{id}`
- **Access**: Public (Resident Client)
- **Request Body**: `{ "action": "IMPRESSION" | "CLICK" }`

---

## 5. Monetization & Subscriptions APIs

### 5.1 Plan Master
`GET /api/v1/plans`
- **Access**: Public / Authenticated
- **Query Params**: `role` (`PROVIDER` | `LOCAL_BUSINESS`)
- **Response** (200 OK): Returns Free and Paid tiers with pricing in INR and billing intervals.

### 5.2 Subscription Management
`POST /api/v1/subscriptions`
- **Access**: Provider / Business
- **Request Body**:
  ```json
  {
    "planId": "plan_uuid",
    "paymentMethod": "UPI"
  }
  ```
- **Response** (200 OK): Generates subscription and payment transaction order with cryptographic tracking ID.

### 5.3 Payment Confirmation & Server Signature Verification
`POST /api/v1/payments`
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "transactionNumber": "TXN-2026-0042",
    "gatewayPaymentId": "pay_live_9948291",
    "gatewaySignature": "hmac_sha256_signature_hex",
    "isSandboxConfirmation": false
  }
  ```
- **Validation**: Verifies cryptographic HMAC-SHA256 signature, ensures transaction idempotency, and transitions subscription to `ACTIVE`.

### 5.4 Platform Monetization Analytics (Admin)
`GET /api/v1/monetization`
- **Access**: Platform Admin only (`PLATFORM_ADMIN`)
- **Metrics Returned**: 100% database-calculated MRR, Total Lifetime Revenue, Average Revenue Per User (ARPU), Active Subscriptions breakdown, and Recent Payment Transactions audit table.

---

## 6. QR Entry & Exit Gate Attendance APIs

### 6.1 Issue Rotating Gate QR Token
`GET /api/v1/qr/gate-token`
- **Access**: Society Security Gate / Management
- **Query Params**: `gateId`, `communityId`
- **Security**: Issues a cryptographically signed HMAC-SHA256 token valid for 60 seconds with strict timestamp expiration.

### 6.2 Provider Scan Gate QR (Entry & Exit State Machine)
`POST /api/v1/qr/scan`
- **Access**: Service Provider (`ROLE: PROVIDER`)
- **Request Body**:
  ```json
  {
    "qrPayload": "base64_encoded_gate_token",
    "serviceRequestId": "req_uuid"
  }
  ```
- **Processing**:
  - Verifies signature and rejects if timestamp is older than 60 seconds.
  - If provider is arriving: Creates/Updates visit to `INSIDE_APARTMENT`, records entry timestamp and gate name.
  - If provider is leaving: Updates visit to `EXITED`, calculates on-campus duration in minutes, and updates job attendance record.

### 6.3 Visit Attendance Records
`GET /api/v1/provider-visits`
- **Access**: Society Management / Platform Admin
- **Query Params**: `communityId`, `status` (`INSIDE_APARTMENT`, `EXITED`, `SCHEDULED`), `date`

### 6.4 Management Manual Attendance Fallback
`POST /api/v1/provider-visits/{id}/manual-correction`
- **Access**: Society Management / Admin
- **Request Body**:
  ```json
  {
    "action": "FORCE_EXIT",
    "reason": "Provider phone battery exhausted at exit gate; security guard physically confirmed departure at 17:30."
  }
  ```
- **Audit**: Writes entry to `VisitAuditLog` with previous state, new state, manager ID, and mandatory reason.
