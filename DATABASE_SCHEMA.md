# DATABASE SCHEMA SPECIFICATION

**Project**: Enterprise Apartment Management & Local Business Marketplace SaaS  
**Version**: 2.0.0 (Post-Upgrade Non-Destructive Schema)  
**Database Engine**: SQLite (Development) / PostgreSQL Compatible (Prisma ORM)  

---

## 1. Overview & Data Model Architecture

The database architecture is designed with strict multi-tenant boundaries, relational integrity, zero data loss, and normalized global identities. 

### Core Relational Groups:
1. **Identities & RBAC**: `User`, `ResidentProfile`, `ProviderProfile`, `LocalBusiness`, `CommunityMember`
2. **Multi-Apartment Real Estate Hierarchy**: `Community`, `ApartmentBlock`, `ApartmentUnit`, `ApartmentGate`
3. **Resident Onboarding Pipelines**: `ResidentInvitation`, `ResidentApplication`
4. **Local Service Provider Coverage**: `ProviderServiceArea`, `ProviderDocument`, `ServiceListing`, `ServiceAvailability`
5. **Marketplace Workflows**: `ServiceRequest`, `ServiceRequestStatusHistory`, `Review`, `Requirement`, `RequirementApplication`, `Conversation`, `Message`, `Notification`, `Report`, `AdminApproval`
6. **Local Business Directory & Advertising**: `LocalBusiness`, `BusinessCampaign`
7. **Monetization & Billing**: `SubscriptionPlan`, `Subscription`, `PaymentTransaction`
8. **Security & Gate Attendance**: `ApartmentGate`, `ProviderVisit`, `VisitAuditLog`

---

## 2. Entity Details & Schema Definitions

### 2.1 Identity & User Master (`User`)
Stores global identity accounts across all five roles. Normalized uniqueness on `phone` and `email`.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key | Global unique user identifier |
| `email` | String | Unique | Lowercase normalized email address |
| `passwordHash`| String | Not Null | Bcrypt hashed credentials |
| `name` | String | Not Null | Full legal or display name |
| `phone` | String | Unique | E.164 formatted normalized mobile number |
| `role` | String | Default: 'RESIDENT' | `RESIDENT`, `PROVIDER`, `MANAGEMENT`, `BUSINESS`, `ADMIN` |
| `status` | String | Default: 'ACTIVE' | `ACTIVE`, `PENDING_VERIFICATION`, `SUSPENDED`, `DEACTIVATED` |
| `isVerified` | Boolean | Default: false | Phone / document verification badge indicator |
| `communityId` | String (UUID) | Nullable, FK → Community | Primary associated apartment community |
| `createdAt` | DateTime | Default: now() | Registration timestamp |
| `updatedAt` | DateTime | Auto-updated | Last modification timestamp |

### 2.2 Apartment Hierarchy (`Community`, `ApartmentBlock`, `ApartmentUnit`, `ApartmentGate`)
Isolates apartment complexes into independent organizational hierarchies.

#### `Community`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key | Unique apartment ID |
| `name` | String | Not Null | e.g. "Palm Heights Residency" |
| `code` | String | Unique | e.g. "PHR-BLR-01" |
| `address` | String | Not Null | Physical street address |
| `city` | String | Not Null | City (e.g. "Bengaluru") |
| `state` | String | Not Null | State (e.g. "Karnataka") |
| `postalCode` | String | Not Null | PIN Code (e.g. "560103") |
| `totalBlocks` | Integer | Default: 4 | Total towers/blocks |
| `totalFlats` | Integer | Default: 240 | Total residential units |
| `heroImage` | String | Nullable | Campus banner URL |
| `status` | String | Default: 'ACTIVE' | `ACTIVE`, `INACTIVE`, `SUSPENDED` |
| `onboardingMode` | String | Default: 'BOTH' | `BOTH`, `MANAGEMENT_INVITE`, `SELF_REGISTER` |
| `managerId` | String (UUID) | Nullable, FK → User | Assigned society management administrator |

#### `ApartmentBlock`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key | Unique block ID |
| `communityId` | String (UUID) | FK → Community | Parent community |
| `name` | String | Not Null | e.g. "Tower A" |
| `code` | String | Nullable | e.g. "TOW-A" |
| `totalFloors` | Integer | Default: 14 | Total floors |
| Unique constraint: `[communityId, name]` |

#### `ApartmentUnit`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key | Unique unit ID |
| `blockId` | String (UUID) | FK → ApartmentBlock | Parent block |
| `floorNumber` | Integer | Default: 1 | Floor number |
| `unitNumber` | String | Not Null | e.g. "101", "304", "1202" |
| `residentType` | String | Default: 'OWNER' | `OWNER`, `TENANT`, `VACANT` |
| `status` | String | Default: 'OCCUPIED' | `OCCUPIED`, `VACANT` |
| Unique constraint: `[blockId, unitNumber]` |

#### `ApartmentGate`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key | Unique gate ID |
| `communityId` | String (UUID) | FK → Community | Parent community |
| `gateName` | String | Not Null | e.g. "Main Security Gate A", "North Service Gate" |
| `gateCode` | String | Unique | e.g. "GATE-PALM-01" |
| `qrSecret` | String | Not Null | Secret key used for HMAC-SHA256 rotating QR tokens |
| `isActive` | Boolean | Default: true | Operational gate flag |

---

### 2.3 Provider Multi-Geographical Coverage (`ProviderServiceArea`)
Enables service professionals to serve multiple localities, PIN codes, and apartment complexes without restriction to a single tower.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key | Unique service area ID |
| `providerProfileId` | String (UUID) | FK → ProviderProfile | Professional provider profile |
| `country` | String | Default: 'India' | Country |
| `state` | String | Default: 'Karnataka' | State |
| `city` | String | Default: 'Bengaluru' | City |
| `locality` | String | Not Null | e.g. "Bellandur", "HSR Layout", "Electronic City" |
| `postalCode` | String | Not Null | 6-digit PIN code (e.g. "560103") |
| `serviceRadiusKm` | Float | Default: 5.0 | Coverage radius from locality center |
| `communityId` | String (UUID) | Nullable, FK → Community | Direct apartment partnership |

---

### 2.4 Local Business & Sponsored Advertising (`LocalBusiness`, `BusinessCampaign`)

#### `LocalBusiness`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key | Unique business ID |
| `userId` | String (UUID) | Unique, FK → User | Merchant user owner |
| `businessName` | String | Not Null | Business or store name |
| `registrationNumber`| String | Nullable | Trade license / GSTIN |
| `category` | String | Not Null | `GROCERY`, `RESTAURANT`, `PHARMACY`, `SALON`, etc. |
| `description` | String | Not Null | Business details |
| `address` | String | Not Null | Physical retail location |
| `city` | String | Default: 'Bengaluru' | Operating city |
| `postalCode` | String | Default: '560103' | Operating PIN |
| `isApproved` | Boolean | Default: false | Admin approval status |
| `status` | String | Default: 'ACTIVE' | `ACTIVE`, `SUSPENDED` |

#### `BusinessCampaign`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key | Unique campaign ID |
| `businessId` | String (UUID) | FK → LocalBusiness | Advertiser |
| `title` | String | Not Null | Campaign title |
| `description` | String | Not Null | Promo offer / discount details |
| `bannerUrl` | String | Not Null | Display ad creative URL |
| `targetCategory` | String | Not Null | Category tag |
| `startDate` | DateTime | Not Null | Campaign start |
| `endDate` | DateTime | Not Null | Campaign expiration |
| `status` | String | Default: 'PENDING_APPROVAL' | `DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `ACTIVE`, `COMPLETED` |
| `impressionsCount`| Integer | Default: 0 | Live resident impression counter |
| `clicksCount` | Integer | Default: 0 | Direct resident click counter |

---

### 2.5 Monetization & Billing (`SubscriptionPlan`, `Subscription`, `PaymentTransaction`)

#### `SubscriptionPlan`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key | Unique plan ID |
| `name` | String | Not Null | Plan name (e.g. "Provider Pro Plus") |
| `targetRole` | String | Not Null | `PROVIDER`, `LOCAL_BUSINESS` |
| `planType` | String | Default: 'PAID' | `FREE`, `PAID` |
| `priceInr` | Float | Default: 0 | Price in Indian Rupees |
| `billingCycle` | String | Default: 'MONTHLY' | `MONTHLY`, `QUARTERLY`, `ANNUAL` |
| `description` | String | Not Null | Plan perks & limitations |
| `isActive` | Boolean | Default: true | Plan catalog active flag |

#### `Subscription`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key | Unique subscription ID |
| `userId` | String (UUID) | FK → User | Subscribed user |
| `planId` | String (UUID) | FK → SubscriptionPlan | Active plan |
| `targetRole` | String | Not Null | `PROVIDER`, `LOCAL_BUSINESS` |
| `status` | String | Default: 'ACTIVE' | `FREE`, `ACTIVE`, `EXPIRED`, `CANCELLED` |
| `currentPeriodStart`| DateTime | Default: now() | Current billing cycle start |
| `currentPeriodEnd` | DateTime | Not Null | Current billing cycle expiration |
| `autoRenew` | Boolean | Default: true | Recurring subscription flag |

#### `PaymentTransaction`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key | Unique transaction ID |
| `transactionNumber` | String | Unique | e.g. "TXN-2026-0042" |
| `userId` | String (UUID) | FK → User | Payer |
| `subscriptionId` | String (UUID) | Nullable, FK → Subscription | Related subscription |
| `campaignId` | String (UUID) | Nullable, FK → BusinessCampaign | Related ad campaign |
| `amountInr` | Float | Not Null | Real payment amount |
| `currency` | String | Default: 'INR' | Currency code |
| `status` | String | Default: 'SUCCESS' | `INITIATED`, `PENDING`, `SUCCESS`, `FAILED` |
| `paymentMethod` | String | Default: 'UPI' | `UPI`, `CARD`, `NETBANKING` |
| `gatewayReference` | String | Nullable | Gateway payment ID |
| `gatewaySignature` | String | Nullable | Cryptographic HMAC signature for audit |

---

### 2.6 QR Attendance & Gate Log (`ProviderVisit`, `VisitAuditLog`)

#### `ProviderVisit`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key | Unique visit ID |
| `serviceRequestId` | String (UUID) | FK → ServiceRequest | Related service booking |
| `providerProfileId`| String (UUID) | FK → ProviderProfile | Servicing professional |
| `communityId` | String (UUID) | FK → Community | Campus where visit took place |
| `gateId` | String (UUID) | Nullable, FK → ApartmentGate | Entry/exit security gate |
| `entryTimestamp` | DateTime | Nullable | Clock-in timestamp |
| `exitTimestamp` | DateTime | Nullable | Clock-out timestamp |
| `durationMinutes` | Integer | Nullable | Total computed on-campus duration |
| `visitStatus` | String | Default: 'SCHEDULED' | `SCHEDULED`, `INSIDE_APARTMENT`, `EXITED`, `CANCELLED` |
| `entryQrToken` | String | Nullable | Cryptographic rotating token used at entry |
| `exitQrToken` | String | Nullable | Cryptographic rotating token used at exit |
| `isManualCorrection`| Boolean | Default: false | Society management override flag |
| `manualCorrectionReason`| String | Nullable | Mandatory audit explanation |
| `correctedById` | String (UUID) | Nullable, FK → User | Society manager who corrected log |

---

## 3. Indexes & Constraints

1. **Identity Uniqueness**:
   - `User.email` UNIQUE
   - `User.phone` UNIQUE
2. **Multi-Tenant Structure**:
   - `ApartmentBlock`: Unique composite `[communityId, name]`
   - `ApartmentUnit`: Unique composite `[blockId, unitNumber]`
   - `CommunityMember`: Unique composite `[communityId, block, flatNumber]`
3. **Security Gate Tokens**:
   - `ApartmentGate.gateCode` UNIQUE
   - `PaymentTransaction.transactionNumber` UNIQUE
