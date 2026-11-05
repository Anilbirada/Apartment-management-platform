# KNOWN ISSUES, SYSTEM LIMITATIONS & RECOMMENDATIONS

**Project**: Enterprise Apartment Management & Local Business Marketplace SaaS  
**Version**: 2.0.0  

---

## 1. Architectural & Operational Considerations

### 1.1 In-Memory OTP Store in Clustered Environments
- **Current Implementation**: `src/lib/otpStore.ts` stores active 6-digit OTPs in a Node.js process memory map with a 5-minute TTL.
- **Limitation**: In a horizontally autoscaling multi-container Kubernetes or multi-instance server cluster, an OTP requested on Instance A might be submitted to Instance B.
- **Recommendation for Large Scale**: Replace the in-memory map with a centralized Redis instance (`ioredis` or Redis Cloud) for distributed OTP storage and global rate limiting.

### 1.2 SQLite Database Provider
- **Current Implementation**: The development configuration runs SQLite via `DATABASE_URL="file:./dev.db"`.
- **Limitation**: SQLite operates on file-level write locking, which can cause contention under high concurrent writes (e.g. dozens of simultaneous gate scans during peak morning rush).
- **Recommendation for Production**: Transition to a hosted PostgreSQL instance (AWS RDS, Supabase, Neon) simply by updating `provider = "postgresql"` in `prisma/schema.prisma` and pointing `DATABASE_URL` to the Postgres connection string. All queries and schema definitions have been written to be 100% PostgreSQL-compatible.

### 1.3 Mobile Camera Permissions over HTTP
- **Current Implementation**: Mobile web camera QR scanning uses `navigator.mediaDevices.getUserMedia`.
- **Limitation**: Web browsers (Chrome, Safari iOS) block camera access on non-secure `http://` origins, with the exception of `localhost`.
- **Recommendation**: Ensure the application is deployed behind HTTPS with a valid SSL/TLS certificate (e.g. Let's Encrypt) before testing camera scanner functionality on physical mobile devices. In local development or manual fallback, the text token fallback input can be used.

### 1.4 Real SMS Gateway Integration
- **Current Implementation**: `src/app/api/v1/auth/otp/send/route.ts` logs OTPs to the console in development and provides `devOtp: "123456"` for instant testing.
- **Recommendation**: In production, configure active credentials for Indian SMS gateways (Fast2SMS, MSG91, Twilio, or AWS SNS) conforming to TRAI DLT template registration requirements.

---

## 2. Summary of Verified Defenses

1. **Zero Phone Leakage**: Verified via automated testing — private mobile numbers are never returned in public resident provider discovery or booking endpoints.
2. **Replay-Proof QR Codes**: Gate QR tokens expire strictly after 60 seconds and cannot be forged without the gate's secret signing key.
3. **Multi-Tenant Isolation**: Society management accounts are strictly constrained to their own `communityId`.
4. **Idempotent Billing**: Double-charging and duplicate subscription activations are rejected by database uniqueness on `transactionNumber`.
