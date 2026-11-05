# DATABASE CHANGE PLAN

**Document Version**: 2.0.0  
**Target Engine**: SQLite (Development) / PostgreSQL (Production) via Prisma ORM  
**Principle**: Zero-loss, non-destructive migration preserving all existing users, communities, listings, and requests.

---

## 1. Safety & Migration Protocol

1. **Non-Destructive Evolution**: No existing tables or columns will be dropped. Any new fields added to existing models will have default values or be marked optional (`?`).
2. **Data Preservation**: Existing seed records (e.g., Vikramaditya Rao - Admin, Sunita Deshmukh - Management, Rahul Sharma - Resident, Ramesh Kumar - Provider, and all 6 category groups) will remain valid and functioning.
3. **Foreign Key Integrity**: All new relational tables use proper foreign key references with cascading deletes on parent removal where appropriate.
4. **Unique Constraints**: Explicit unique indexes will be established on normalized emails, normalized mobile numbers, request numbers, and QR token records.

---

## 2. Detailed Schema Additions & Modifications

### 2.1 Modifications to Existing Models

#### `User` Model
- Add optional relations:
  - `businessProfile`: One-to-one with `LocalBusiness`
  - `subscriptions`: One-to-many with `Subscription`
  - `payments`: One-to-many with `PaymentTransaction`
  - `residentApplications`: One-to-many with `ResidentApplication`
  - `residentInvitations`: One-to-many with `ResidentInvitation`
  - `createdApartments`: One-to-many with `Community` (Admin audit)

#### `Community` (Apartment) Model
- Add fields:
  - `status`: String @default("ACTIVE") (ACTIVE, INACTIVE, SUSPENDED)
  - `onboardingMode`: String @default("BOTH") (BOTH, MANAGEMENT_INVITE, SELF_REGISTER)
  - `contactPerson`: String?
  - `contactPhone`: String?
  - `contactEmail`: String?
- Add relations:
  - `blocks`: One-to-many with `ApartmentBlock`
  - `gates`: One-to-many with `ApartmentGate`
  - `residentApplications`: One-to-many with `ResidentApplication`
  - `residentInvitations`: One-to-many with `ResidentInvitation`
  - `providerVisits`: One-to-many with `ProviderVisit`
  - `serviceAreas`: One-to-many with `ProviderServiceArea`

#### `ProviderProfile` Model
- Add relations:
  - `serviceAreas`: One-to-many with `ProviderServiceArea`
  - `visits`: One-to-many with `ProviderVisit`

#### `ServiceRequest` Model
- Add relation:
  - `visits`: One-to-many with `ProviderVisit`

---

### 2.2 New Enterprise Models

#### 1. Apartment Structure: `ApartmentBlock` & `ApartmentUnit`
```prisma
model ApartmentBlock {
  id           String          @id @default(uuid())
  communityId  String
  name         String          // e.g., "Tower A", "Block B"
  code         String?
  totalFloors  Int             @default(14)
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  community    Community       @relation(fields: [communityId], references: [id], onDelete: Cascade)
  units        ApartmentUnit[]

  @@unique([communityId, name])
}

model ApartmentUnit {
  id           String          @id @default(uuid())
  blockId      String
  floorNumber  Int             @default(1)
  unitNumber   String          // e.g., "101", "304"
  residentType String          @default("OWNER") // OWNER, TENANT, VACANT
  status       String          @default("OCCUPIED") // OCCUPIED, VACANT
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  block        ApartmentBlock  @relation(fields: [blockId], references: [id], onDelete: Cascade)

  @@unique([blockId, unitNumber])
}
```

#### 2. Resident Onboarding: `ResidentApplication` & `ResidentInvitation`
```prisma
model ResidentApplication {
  id               String      @id @default(uuid())
  communityId      String
  userId           String
  block            String
  flatNumber       String
  residentType     String      @default("OWNER") // OWNER, TENANT
  proofDocumentUrl String?
  status           String      @default("PENDING") // PENDING, APPROVED, REJECTED, SUSPENDED
  rejectionReason  String?
  reviewedById     String?
  reviewedAt       DateTime?
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt

  community        Community   @relation(fields: [communityId], references: [id], onDelete: Cascade)
  user             User        @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model ResidentInvitation {
  id               String      @id @default(uuid())
  communityId      String
  email            String
  phone            String
  name             String
  block            String
  flatNumber       String
  residentType     String      @default("OWNER")
  token            String      @unique
  status           String      @default("PENDING") // PENDING, ACCEPTED, EXPIRED
  invitedById      String?
  expiresAt        DateTime
  createdAt        DateTime    @default(now())

  community        Community   @relation(fields: [communityId], references: [id], onDelete: Cascade)
  invitedBy        User?       @relation(fields: [invitedById], references: [id])
}
```

#### 3. Geographic Provider Coverage: `ProviderServiceArea`
```prisma
model ProviderServiceArea {
  id                String          @id @default(uuid())
  providerProfileId String
  country           String          @default("India")
  state             String          @default("Karnataka")
  city              String          @default("Bengaluru")
  locality          String          // e.g. "Bellandur", "HSR Layout", "Electronic City"
  postalCode        String          // e.g. "560103"
  serviceRadiusKm   Float           @default(5.0)
  communityId       String?         // Optional direct apartment link
  createdAt         DateTime        @default(now())

  providerProfile   ProviderProfile @relation(fields: [providerProfileId], references: [id], onDelete: Cascade)
  community         Community?      @relation(fields: [communityId], references: [id])
}
```

#### 4. Local Business: `LocalBusiness` & `BusinessCampaign`
```prisma
model LocalBusiness {
  id                 String             @id @default(uuid())
  userId             String             @unique
  businessName       String
  registrationNumber String?
  category           String             // GROCERY, RESTAURANT, PHARMACY, SALON, HARDWARE, CLEANING_AGENCY, OTHER
  description        String
  logoUrl            String?
  bannerUrl          String?
  address            String
  city               String
  state              String
  postalCode         String
  contactPhone       String
  contactEmail       String
  website            String?
  operatingAreasJson String?            // JSON array of localities served
  targetApartments   String?            // JSON array of targeted apartment IDs
  isApproved         Boolean            @default(false)
  verificationStatus String             @default("PENDING") // PENDING, APPROVED, REJECTED
  status             String             @default("ACTIVE")
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  user               User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  campaigns          BusinessCampaign[]
}

model BusinessCampaign {
  id                   String             @id @default(uuid())
  businessId           String
  title                String
  description          String
  bannerUrl            String
  targetCategory       String
  targetCity           String             @default("Bengaluru")
  targetLocalitiesJson String?            // JSON array of localities
  targetApartmentsJson String?            // JSON array of community IDs
  startDate            DateTime
  endDate              DateTime
  status               String             @default("PENDING_APPROVAL") // DRAFT, PENDING_APPROVAL, APPROVED, SCHEDULED, ACTIVE, PAUSED, COMPLETED, REJECTED, EXPIRED
  rejectionReason      String?
  impressionsCount     Int                @default(0)
  clicksCount          Int                @default(0)
  approvedById         String?
  approvedAt           DateTime?
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt

  business             LocalBusiness      @relation(fields: [businessId], references: [id], onDelete: Cascade)
  payments             PaymentTransaction[]
}
```

#### 5. Monetization: `SubscriptionPlan`, `Subscription`, `PaymentTransaction`
```prisma
model SubscriptionPlan {
  id                     String         @id @default(uuid())
  name                   String         // e.g., "Provider Starter", "Provider Pro", "Business Prime"
  targetRole             String         // PROVIDER, LOCAL_BUSINESS
  planType               String         @default("PAID") // FREE, PAID
  priceInr               Float          @default(0)
  billingCycle           String         @default("MONTHLY") // MONTHLY, QUARTERLY, ANNUAL
  description            String
  featureEntitlementsJson String?       // JSON object of feature flags / limits
  isActive               Boolean        @default(true)
  sortOrder              Int            @default(0)
  createdAt              DateTime       @default(now())
  updatedAt              DateTime       @updatedAt

  subscriptions          Subscription[]
}

model Subscription {
  id                 String             @id @default(uuid())
  userId             String
  planId             String
  targetRole         String             // PROVIDER, LOCAL_BUSINESS
  status             String             @default("ACTIVE") // FREE, PENDING_PAYMENT, ACTIVE, EXPIRED, CANCELLED, SUSPENDED, PAYMENT_FAILED
  currentPeriodStart DateTime           @default(now())
  currentPeriodEnd   DateTime
  autoRenew          Boolean            @default(true)
  cancelledAt        DateTime?
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  user               User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan               SubscriptionPlan   @relation(fields: [planId], references: [id], onDelete: Cascade)
  payments           PaymentTransaction[]
}

model PaymentTransaction {
  id                String            @id @default(uuid())
  transactionNumber String            @unique // e.g. "TXN-2026-0001"
  userId            String
  subscriptionId    String?
  campaignId        String?
  amountInr         Float
  currency          String            @default("INR")
  status            String            @default("SUCCESS") // INITIATED, PENDING, SUCCESS, FAILED, REFUNDED
  paymentMethod     String            @default("UPI") // UPI, CARD, NETBANKING, WALLET
  gatewayReference  String?           // Payment Gateway Order / Payment ID
  gatewaySignature  String?
  metadataJson      String?
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  user              User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  subscription      Subscription?     @relation(fields: [subscriptionId], references: [id])
  campaign          BusinessCampaign? @relation(fields: [campaignId], references: [id])
}
```

#### 6. Provider Attendance & QR Scanning: `ApartmentGate`, `ProviderVisit`, `VisitAuditLog`
```prisma
model ApartmentGate {
  id           String          @id @default(uuid())
  communityId  String
  gateName     String          // e.g., "Main Security Gate A", "Service Gate 2"
  gateCode     String          @unique // e.g., "GATE-PALM-01"
  qrSecret     String          // Secret key for rotating HMAC signature verification
  isActive     Boolean         @default(true)
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  community    Community       @relation(fields: [communityId], references: [id], onDelete: Cascade)
  visits       ProviderVisit[]
}

model ProviderVisit {
  id                     String          @id @default(uuid())
  serviceRequestId       String
  providerProfileId      String
  communityId            String
  gateId                 String?
  entryTimestamp         DateTime?
  exitTimestamp          DateTime?
  durationMinutes        Int?
  visitStatus            String          @default("SCHEDULED") // SCHEDULED, INSIDE_APARTMENT, EXITED, CANCELLED, REJECTED
  entryQrToken           String?
  exitQrToken            String?
  isManualCorrection     Boolean         @default(false)
  manualCorrectionReason String?
  correctedById          String?
  createdAt              DateTime        @default(now())
  updatedAt              DateTime        @updatedAt

  serviceRequest         ServiceRequest  @relation(fields: [serviceRequestId], references: [id], onDelete: Cascade)
  providerProfile        ProviderProfile @relation(fields: [providerProfileId], references: [id], onDelete: Cascade)
  community              Community       @relation(fields: [communityId], references: [id], onDelete: Cascade)
  gate                   ApartmentGate?  @relation(fields: [gateId], references: [id])
  auditLogs              VisitAuditLog[]
}

model VisitAuditLog {
  id               String        @id @default(uuid())
  visitId          String
  action           String        // ENTRY_RECORDED, EXIT_RECORDED, MANUAL_CORRECTION, SCAN_REJECTED
  performedById    String?
  previousStateJson String?
  newStateJson     String?
  reason           String?
  timestamp        DateTime      @default(now())

  visit            ProviderVisit @relation(fields: [visitId], references: [id], onDelete: Cascade)
}
```

---

## 3. Migration Execution Strategy
1. Update `prisma/schema.prisma` with new models and relations.
2. Execute `npx prisma db push` to synchronize SQLite dev database schema without destroying data.
3. Update `prisma/seed.js` to seed sample multi-apartments, blocks, units, local businesses, subscription plans, active subscriptions, ad campaigns, and provider entry/exit QR gates.
4. Run `npx prisma generate` to rebuild Prisma client types.
