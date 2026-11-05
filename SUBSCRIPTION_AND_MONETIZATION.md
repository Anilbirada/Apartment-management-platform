# SUBSCRIPTION & MONETIZATION ENGINE

**Project**: Enterprise Apartment Management & Local Business Marketplace SaaS  
**Version**: 2.0.0  
**Billing Engine**: Multi-Tier SaaS with Cryptographic Webhook/Callback Verification  

---

## 1. Monetization Strategy Overview

The platform implements a sustainable, dual-sided monetization model:
1. **Service Providers**:
   - **Free Basic**: Single service area coverage, basic listing placement.
   - **Provider Pro (₹499/mo)**: Multi-area coverage (up to 3 localities), priority listing badge, customer chat.
   - **Provider Enterprise (₹999/mo)**: Unlimited geographical coverage, same-day verified badge, analytics.
2. **Local Businesses**:
   - **Free Merchant**: Store profile directory listing.
   - **Business Standard (₹1,499/mo)**: Business directory badge, 1 active sponsored ad campaign per month.
   - **Business Premium (₹2,999/mo)**: Up to 5 concurrent campaigns, multi-society targeting, direct resident deal banners.
3. **Residents**:
   - **100% Free**: Residents are never charged to search providers, post requirements, or view sponsored partner deals.

---

## 2. Server-Side Payment Verification & Idempotency

All payment transactions follow a strict two-phase commit protocol with cryptographic signature verification:

```
Provider / Business            Server Backend                 Gateway / Webhook
        │                             │                               │
        │── 1. POST /subscriptions ──>│                               │
        │                             │── 2. Create Order / Txn ─────>│
        │<── Return Txn & Signature ──│                               │
        │                             │                               │
        │── 3. Complete Payment ─────────────────────────────────────>│
        │                             │                               │
        │── 4. POST /payments ───────>│                               │
        │   (Txn, PayId, Signature)   │── 5. HMAC-SHA256 Verify ──────│
        │                             │   (Match Expected vs Given)   │
        │                             │── 6. Idempotency Check        │
        │<── 200 OK: Plan Activated ──│   (Ensure No Double-Credit)   │
```

### Signature Verification Algorithm
```typescript
const payload = `${transactionNumber}:${amountInr}:${currency}`;
const expectedSignature = crypto
  .createHmac('sha256', process.env.PAYMENT_GATEWAY_SECRET!)
  .update(payload)
  .digest('hex');

if (gatewaySignature !== expectedSignature) {
  throw new Error('Cryptographic payment signature mismatch: Transaction rejected');
}
```

---

## 3. Platform Admin Monetization Dashboard

The admin monetization console (`/admin/monetization` powered by `GET /api/v1/monetization`) calculates all metrics **directly from live database records without mock numbers**:

1. **Monthly Recurring Revenue (MRR)**:
   $$\text{MRR} = \sum_{\text{active paid subscriptions}} \text{plan.priceInr}$$
2. **Total Lifetime Revenue**:
   $$\text{Lifetime Revenue} = \sum_{\text{status} = \text{'SUCCESS'}} \text{paymentTransaction.amountInr}$$
3. **Average Revenue Per User (ARPU)**:
   $$\text{ARPU} = \frac{\text{Lifetime Revenue}}{\text{Total Registered Paying Accounts}}$$
4. **Subscription Distribution**: Live count of Free vs. Paid subscribers grouped by `PROVIDER` and `LOCAL_BUSINESS`.
5. **Real Transaction Audit Ledger**: Filterable table showing transaction numbers, dates, payment methods (UPI, Card, Netbanking), and cryptographic gateway signatures.
