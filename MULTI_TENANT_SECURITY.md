# MULTI-TENANT ARCHITECTURE & SECURITY

**Project**: Enterprise Apartment Management & Local Business Marketplace SaaS  
**Version**: 2.0.0  
**Multi-Tenancy Model**: Shared-Database / Logical-Isolation Tenant Architecture  

---

## 1. Architectural Model

The platform operates on a centralized SaaS architecture supporting multiple apartment communities under unified administration. To balance high scalability with rigorous operational security, the platform employs **Logical Tenant Isolation enforced at the query and middleware layers**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CENTRALIZED SAAS ENGINE                         │
├────────────────────────────────────────────────────────────────────────┤
│                     GLOBAL PLATFORM ADMINISTRATOR                      │
└──────┬──────────────────────────────────────────────────────────┬──────┘
       │                                                          │
┌──────▼───────────────────────────┐      ┌───────────────────────▼────────┐
│ TENANT 1: PALM HEIGHTS RESIDENCY │      │ TENANT 2: GREEN VALLEY HEIGHTS │
├──────────────────────────────────┤      ├────────────────────────────────┤
│ • Society Manager: mgr_palm      │      │ • Society Manager: mgr_green   │
│ • Isolated Resident Records      │      │ • Isolated Resident Records    │
│ • Towers A, B, C, D              │      │ • Block East, Block West       │
│ • Private Gate QR Codes          │      │ • Private Gate QR Codes        │
│ • Isolated Attendance Log        │      │ • Isolated Attendance Log      │
└──────────────────────────────────┘      └────────────────────────────────┘
```

---

## 2. Multi-Tenant Isolation Guarantees

### 2.1 Society Management Boundary
- A Society Administrator assigned to Apartment $A$ has permissions strictly bounded by `communityId == A.id`.
- Every society management API endpoint (`/api/v1/apartments/{id}/*`, `/api/v1/provider-visits`, etc.) verifies:
  1. The authenticated user holds `role: 'MANAGEMENT'` or `role: 'ADMIN'`.
  2. If `MANAGEMENT`, `user.communityId === request.params.id`.
  3. Attempting to query or modify data belonging to another apartment triggers an immediate `403 Forbidden` response.

### 2.2 Resident Data Isolation
- Residents are mapped to their apartment via `CommunityMember` and `communityId`.
- Resident flat numbers, internal applications, and rental verification documents are **never visible** to management users of competing apartment complexes.

### 2.3 Provider Multi-Tenant Operations
- Service providers are **not restricted** to a single apartment complex.
- Providers can register multiple service areas (`ProviderServiceArea`) covering entire localities (e.g. Bellandur, HSR Layout, Sarjapur) and multiple apartment communities.
- However, when a provider visits an apartment, attendance logging strictly records the specific `communityId` and gate ID where physical entry occurred.

---

## 3. Query Layer Enforcement Examples

### 3.1 Resident Directory Isolation
```typescript
// Strict isolation in src/app/api/v1/apartments/[id]/residents/route.ts
const targetCommunityId = params.id;

if (currentUser.role === 'MANAGEMENT' && currentUser.communityId !== targetCommunityId) {
  return NextResponse.json({ error: 'Access denied: Cannot access another society' }, { status: 403 });
}

const members = await prisma.communityMember.findMany({
  where: { communityId: targetCommunityId },
  include: { user: true }
});
```

### 3.2 Provider Attendance Isolation
```typescript
// Strict isolation in src/app/api/v1/provider-visits/route.ts
const whereClause: any = {};
if (currentUser.role === 'MANAGEMENT') {
  whereClause.communityId = currentUser.communityId; // Manager can ONLY see their campus
}
const visits = await prisma.providerVisit.findMany({ where: whereClause });
```

---

## 4. Verification & Penetration Testing

The automated test suite (`scripts/test-e2e.js`, Scenario 12) conducts systematic isolation verification:
1. Queries units and residents across two separate apartment communities (`Palm Heights` and `Green Valley`).
2. Validates that no units or residents from Apartment $B$ bleed into Apartment $A$'s query result set.
3. Simulates cross-tenant token tampering, verifying that gate tokens signed by Gate $A$ are rejected if presented at Gate $B$.
