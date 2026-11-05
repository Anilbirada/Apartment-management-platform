# CUSTOMER DECISIONS REQUIRED

**Document Purpose**: Highlights commercial, operational, and architectural parameters pending final customer determination. Per the engineering guidelines, default configurable values have been implemented to keep development moving forward without hardcoding unauthorized commercial rules.

---

## Decision Matrix

| # | Pending Decision | Business Impact | Implemented Configurable Architecture | Recommended Default Option | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Subscription Pricing & Billing Cycles** | Defines revenue per provider and local business account. | Dynamic `SubscriptionPlan` model supports arbitrary INR prices and cycles (`MONTHLY`, `QUARTERLY`, `ANNUAL`). Admin can create/edit plans from UI. | Provider Starter: ₹0 (Free); Provider Pro: ₹499/mo; Business Prime: ₹1,499/mo. | Configurable via Admin |
| **2** | **Payment Gateway Selection** | Determines Indian payment processing gateway credentials. | Abstracted payment provider interface with sandbox simulator supporting Razorpay / Cashfree signature verification. | Razorpay Standard Checkout in Test Mode until production key_id / secret are provided. | Sandbox Active |
| **3** | **Advertising Campaign Pricing & Free Model** | Determines whether businesses pay per campaign, per impression/click, or flat subscription. | `BusinessCampaign` supports both admin-approved free campaigns and paid campaigns linked to `PaymentTransaction`. | Free basic campaigns for subscribed businesses (up to 2 active); ₹999 flat per targeted apartment community for non-subscribers. | Configurable |
| **4** | **QR Token Rotation & Issuing Method** | Determines whether QR codes are printed permanently at physical security gates or generated dynamically per appointment. | `ApartmentGate` supports rotating HMAC-signed tokens with timestamp verification, and appointments link to `ProviderVisit`. | Dynamic Gate QR refreshed every 5 minutes on a tablet at security gate, plus per-appointment backup digital pass. | Implemented & Configurable |
| **5** | **SMS / WhatsApp Gateway Provider** | External delivery of mobile OTP and dispatch alerts. | Extensible SMS service adapter with secure dev simulator logging OTPs to console / session for testing. | Fast2SMS or MSG91 with DLT-registered templates for Indian mobile numbers. | Simulator Active |
| **6** | **Single Active Device Policy** | Whether user sessions should be forcibly terminated across older devices upon login. | Multi-session JWT supported with individual token expiration (7 days). Session revocation hook prepared. | Allow simultaneous sessions across 2 devices (e.g. mobile + laptop) unless user triggers explicit logout. | Configurable |
| **7** | **Provider Mandatory Verification Docs** | Which documents are mandatory for verification approval (e.g. Aadhaar vs. Police Clearance). | `ProviderDocument` accepts document types (`ID_PROOF`, `POLICE_VERIFICATION`, `TRADE_LICENSE`, `CERTIFICATE`) with per-document admin review. | Mandatory Aadhaar / Voter ID; Police Clearance mandatory for in-home roles (Babysitter, Elder Care, Maid, Cook). | Configurable |
| **8** | **Default Provider Service Radius** | Default search distance in kilometers around an apartment. | `ProviderServiceArea.serviceRadiusKm` configured per area (default 5 km). | 5.0 km for urban high-density corridors; 10.0 km for suburban zones. | Implemented |

---

## Action Required by Customer

To transition from Sandbox mode to live Production operations:
1. Provide production Payment Gateway credentials (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).
2. Provide transactional SMS provider credentials (`SMS_GATEWAY_API_KEY`, Sender ID).
3. Confirm final monthly and annual subscription pricing tiers.
4. Confirm advertising campaign pricing policy per community.
