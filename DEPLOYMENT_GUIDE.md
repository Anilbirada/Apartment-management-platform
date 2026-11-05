# PRODUCTION DEPLOYMENT & OPERATIONS GUIDE

**Project**: Enterprise Apartment Management & Local Business Marketplace SaaS  
**Version**: 2.0.0  
**Stack**: Next.js 14 (App Router), Prisma ORM, SQLite/PostgreSQL, Tailwind CSS, TypeScript  

---

## 1. System Requirements

- **Runtime**: Node.js 18.18+ or 20.x LTS
- **Package Manager**: npm 9+
- **Database**:
  - Development / Staging: SQLite (`file:./dev.db`)
  - Production SaaS: PostgreSQL 14+ recommended (change `provider = "postgresql"` in `prisma/schema.prisma`)
- **OS**: Linux (Ubuntu 22.04 LTS / Debian 12), Windows Server, or Docker Container

---

## 2. Environment Variables Specification

Create or update `.env` in the project root:

```env
# ----------------------------------------------------
# APPLICATION ENVIRONMENT
# ----------------------------------------------------
NODE_ENV="production"
PORT=3000
NEXT_PUBLIC_APP_URL="https://app.palmheights.com"

# ----------------------------------------------------
# DATABASE CONNECTION
# ----------------------------------------------------
# SQLite Development / Single-Server Setup:
DATABASE_URL="file:./dev.db"

# Or PostgreSQL Production Connection String:
# DATABASE_URL="postgresql://saas_user:StrongPassword@localhost:5432/apartment_saas?schema=public"

# ----------------------------------------------------
# AUTHENTICATION & SECURITY
# ----------------------------------------------------
JWT_SECRET="generate_a_64_character_random_hex_string_here"
QR_HMAC_SECRET="dev_qr_attendance_super_secret_signing_key_2026"

# ----------------------------------------------------
# PAYMENT GATEWAY INTEGRATION
# ----------------------------------------------------
PAYMENT_GATEWAY_PROVIDER="RAZORPAY"
PAYMENT_GATEWAY_KEY_ID="rzp_live_key_here"
PAYMENT_GATEWAY_KEY_SECRET="rzp_live_secret_here"
PAYMENT_GATEWAY_WEBHOOK_SECRET="webhook_secret_here"

# ----------------------------------------------------
# SMS OTP GATEWAY INTEGRATION
# ----------------------------------------------------
SMS_GATEWAY_PROVIDER="FAST2SMS"
SMS_GATEWAY_API_KEY="your_sms_api_key_here"
# If left blank, system falls back to console logger + dev OTP in non-production
```

---

## 3. Deployment Step-by-Step

### Step 1: Install Dependencies
```bash
npm ci --prefer-offline
```

### Step 2: Database Migration & Schema Generation
```bash
# Push schema changes safely
npx prisma db push

# Generate fresh Prisma Client
npx prisma generate

# Seed initial communities, roles, plans, and categories (if fresh install)
node prisma/seed.js
```

### Step 3: Run Quality Assurance Test Suite
Before launching to users, run the automated 12-scenario verification suite:
```bash
node scripts/test-e2e.js
```
Ensure all 12 scenarios pass with zero failures.

### Step 4: Build Optimized Production Assets
```bash
npm run build
```
Verify that all 36 routes build cleanly without TypeScript or Webpack errors.

### Step 5: Launch Service
```bash
npm run start
```
The application will listen on port 3000.

---

## 4. Production Reverse Proxy Configuration (Nginx)

For high-concurrency production deployments, run Next.js behind an Nginx reverse proxy with SSL termination:

```nginx
server {
    listen 80;
    server_name app.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/app.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
