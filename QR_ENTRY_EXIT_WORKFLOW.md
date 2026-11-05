# PROVIDER QR ENTRY & EXIT ATTENDANCE WORKFLOW

**Project**: Enterprise Apartment Management & Local Business Marketplace SaaS  
**Version**: 2.0.0  
**Security Standard**: Rotating HMAC-SHA256 Cryptographic Gate Pass  

---

## 1. Architectural Concept & Attack Prevention

Traditional static QR codes pasted at security gates suffer from serious security flaws: visitors take photos of the QR code and reuse them later to gain unauthorized entry.

To eliminate this vulnerability, the platform implements a **Cryptographically Signed, Rotating Gate Token System**:

1. **Short-Lived Rotating Tokens (60-Second TTL)**:
   - The security gate display terminal fetches a new signed token every 30 seconds from `GET /api/v1/qr/gate-token`.
   - The token contains: `gateId`, `communityId`, `timestamp`, and an HMAC-SHA256 signature generated with the gate's private `qrSecret`.
2. **Replay & Screenshot Immunity**:
   - If a provider scans a photographed or forwarded QR code older than 60 seconds, the backend immediately rejects the request: `"QR Token has expired. Please scan the live terminal."`
3. **Cryptographic Integrity**:
   - Modifying any parameter (e.g. attempting to scan a Palm Heights token at Green Valley) causes an immediate signature verification mismatch.

---

## 2. Gate Attendance State Machine

```
   ┌──────────────────────────────────────────────────────────────┐
   │                     1. SCHEDULED VISIT                       │
   │  (Resident booked provider; Job status: VISIT_SCHEDULED)     │
   └──────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
   ┌──────────────────────────────────────────────────────────────┐
   │                 2. ARRIVAL AT SECURITY GATE                  │
   │  • Provider opens camera scanner in Provider Dashboard       │
   │  • Scans rotating QR on security terminal                    │
   │  • Backend validates signature, appointment, and timestamp   │
   │  • Visit record transitions: INSIDE_APARTMENT                │
   │  • ServiceRequest status transitions: IN_PROGRESS            │
   └──────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
   ┌──────────────────────────────────────────────────────────────┐
   │                    3. WORK ON PREMISES                       │
   │  • Provider listed on Society Management Live Campus Monitor │
   └──────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
   ┌──────────────────────────────────────────────────────────────┐
   │                  4. DEPARTURE AT EXIT GATE                   │
   │  • Provider scans exit gate QR code                          │
   │  • Backend calculates: durationMinutes = exitTime - entryTime│
   │  • Visit record transitions: EXITED                          │
   │  • Provider prompts photo proof & marks job COMPLETED        │
   └──────────────────────────────────────────────────────────────┘
```

---

## 3. Society Management Live Monitoring & Manual Fallback

### 3.1 Live Campus Monitor
From `/management/dashboard` (Section: "Gate Attendance & On-Campus Visitors"):
- Society security staff can monitor currently active providers on campus in real-time.
- Shows provider name, service category, flat being visited, entry gate, and elapsed on-campus minutes.

### 3.2 Manual Override & Audit Logging
In scenarios where a provider's phone battery runs out or network is temporarily unavailable at the exit barrier, society management can perform a manual correction (`POST /api/v1/provider-visits/{id}/manual-correction`):
- Security personnel physically confirms departure.
- Manager clicks **"Force Exit"**.
- A mandatory explanation is required (e.g. `"Provider phone battery died; guard confirmed exit at 18:15"`).
- The system automatically creates a `VisitAuditLog` record preserving the previous state, new state, manager ID, timestamp, and explanation for society committee transparency.
