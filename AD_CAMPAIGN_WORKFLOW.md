# LOCAL BUSINESS ADVERTISING CAMPAIGN WORKFLOW

**Project**: Enterprise Apartment Management & Local Business Marketplace SaaS  
**Version**: 2.0.0  
**Module**: Hyperlocal Sponsored Advertising Engine  

---

## 1. Overview & Business Rules

Local businesses (grocery stores, pharmacies, neighborhood salons, organic markets, restaurants) can promote deals directly to apartment residents.

### Critical Business Rules
1. **Zero Resident Billing**: Residents must **never** be charged to browse campaigns, view deal banners, or redeem local partner promotions.
2. **Moderation Before Publication**: Every advertising campaign requires platform administrative or society management review before appearing in residents' feeds.
3. **Hyperlocal Targeting**: Businesses can target:
   - City-wide (all apartments in Bengaluru).
   - Specific localities (e.g. Bellandur, HSR Layout).
   - Specific apartment communities (e.g. Palm Heights, Green Valley).

---

## 2. Campaign Lifecycle State Machine

```
   ┌──────────┐      Submit for Review      ┌────────────────────┐
   │  DRAFT   │ ──────────────────────────> │  PENDING_APPROVAL  │
   └──────────┘                             └─────────┬──────────┘
                                                      │
                                   ┌──────────────────┴──────────────────┐
                                   ▼                                     ▼
                            ┌──────────────┐                      ┌──────────────┐
                            │   APPROVED   │                      │   REJECTED   │
                            └──────┬───────┘                      │(With Reason) │
                                   │                              └──────────────┘
                                   ▼
                            ┌──────────────┐
                            │    ACTIVE    │ (Displaying on resident home feed)
                            └──────┬───────┘
                                   │
                                   ▼
                            ┌──────────────┐
                            │  COMPLETED   │ (Campaign duration expired)
                            └──────────────┘
```

---

## 3. Step-by-Step Campaign Workflow

### Step 1: Merchant Builds Campaign
From `/business/dashboard`:
1. Merchant fills in the campaign wizard:
   - **Campaign Headline**: e.g., "Flat 25% Off Fresh Vegetables & Dairy"
   - **Offer Details**: Promo code and terms.
   - **Display Creative**: 16:9 banner image URL.
   - **Targeting**: Selection of target apartment communities.
   - **Duration & Budget**: 30-day run at standard sponsorship rate.
2. Status defaults to `PENDING_APPROVAL`.

### Step 2: Administrative Moderation
From `/admin/approvals` (Tab: "Ad Campaigns"):
1. Admin inspects campaign banner, promotional wording, and targeting.
2. Admin approves (transitions status to `ACTIVE`) or declines with mandatory feedback.

### Step 3: Resident Home Feed Display
From `src/components/home/SponsoredAdBanner.tsx`:
1. When a resident visits the home page or service discovery screen, the component calls `GET /api/v1/campaigns?communityId={communityId}`.
2. The active campaign displays with a high-contrast badge: **"Sponsored Local Partner Deal"**.
3. Background analytics tracker automatically fires an `IMPRESSION` event (`POST /api/v1/campaigns/{id}/track`).
4. When a resident clicks "Redeem Offer", a `CLICK` event is tracked and the merchant details are presented.
