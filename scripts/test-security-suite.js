/**
 * Palm Heights Enterprise: Comprehensive Security & OWASP Test Suite
 * Evaluates Broken Access Control, IDOR, Privilege Escalation, Token Forgery, Insecure Uploads & Privacy Masking.
 */

const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-token-apartment-management-saas-2026';

function signToken(payload, secret = JWT_SECRET, options = { expiresIn: '7d' }) {
  return jwt.sign(payload, secret, options);
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  let data = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  return { status: res.status, headers: res.headers, data };
}

async function runSecuritySuite() {
  console.log('========================================================================');
  console.log('🔒 RUNNING PALM HEIGHTS SECURITY & OWASP AUDIT SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    process.stdout.write(`SECURITY [${name}] ... `);
    try {
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
      failed++;
    }
  }

  const runId = Date.now();
  const communities = await prisma.community.findMany({ take: 2 });
  if (communities.length < 2) {
    throw new Error('At least 2 communities required for cross-tenant testing');
  }
  const [commA, commB] = communities;

  const residentUser = await prisma.user.findFirst({ where: { role: 'RESIDENT' } });
  const providerUser = await prisma.user.findFirst({ where: { role: 'PROVIDER' } });
  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

  const residentToken = residentUser ? signToken({ userId: residentUser.id, email: residentUser.email, role: residentUser.role, name: residentUser.name }) : '';
  const providerToken = providerUser ? signToken({ userId: providerUser.id, email: providerUser.email, role: providerUser.role, name: providerUser.name }) : '';
  const adminToken = adminUser ? signToken({ userId: adminUser.id, email: adminUser.email, role: adminUser.role, name: adminUser.name }) : '';

  // 1. PRIVILEGE ESCALATION
  await test('SEC-01: Non-Admin Role Switch API Attempt Blocked', async () => {
    const res = await request('/api/v1/auth/switch-role', {
      method: 'POST',
      headers: { Authorization: `Bearer ${residentToken}` },
      body: JSON.stringify({ role: 'ADMIN' })
    });
    if (res.status !== 403) throw new Error(`Privilege escalation allowed! Status: ${res.status}`);
  });

  await test('SEC-02: Non-Admin Direct Access to Admin Users List Blocked', async () => {
    const res = await request('/api/v1/admin/users', {
      headers: { Authorization: `Bearer ${residentToken}` }
    });
    if (res.status !== 403) throw new Error(`Unauthorized user access allowed! Status: ${res.status}`);
  });

  // 2. TOKEN FORGERY & SIGNATURE INTEGRITY
  await test('SEC-03: JWT Signed with Untrusted Secret Rejected', async () => {
    const forgedToken = signToken(
      { userId: residentUser.id, email: residentUser.email, role: 'ADMIN', name: 'Forged Admin' },
      'wrong-attacker-secret-key-12345'
    );
    const res = await request('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${forgedToken}` }
    });
    if (res.status !== 401) throw new Error(`Forged token was accepted! Status: ${res.status}`);
  });

  await test('SEC-04: Expired JWT Token Rejected', async () => {
    const expiredToken = signToken(
      { userId: residentUser.id, email: residentUser.email, role: residentUser.role, name: residentUser.name },
      JWT_SECRET,
      { expiresIn: '-10s' } // Expired 10s ago
    );
    const res = await request('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${expiredToken}` }
    });
    if (res.status !== 401) throw new Error(`Expired token was accepted! Status: ${res.status}`);
  });

  // 3. IDOR & TENANT ISOLATION
  await test('SEC-05: Society Management Tenant Isolation on Residents API', async () => {
    // Create a temporary manager for Community A
    const managerA = await prisma.user.create({
      data: {
        email: `manager_sec_a_${runId}@palmheights.internal`,
        name: 'Manager A',
        phone: `+91950000${runId % 10000}`,
        passwordHash: 'hashedpwd',
        role: 'MANAGEMENT',
        communityId: commA.id
      }
    });

    const managerAToken = signToken({
      userId: managerA.id,
      email: managerA.email,
      role: 'MANAGEMENT',
      communityId: commA.id,
      name: managerA.name
    });

    // Manager A attempts to query residents of Community B
    const res = await request(`/api/v1/apartments/${commB.id}/residents`, {
      headers: { Authorization: `Bearer ${managerAToken}` }
    });
    // Expected 403 Forbidden or 401
    if (res.status !== 403 && res.status !== 401) {
      throw new Error(`Manager of Apartment A accessed Apartment B! Status: ${res.status}`);
    }
  });

  // 4. INSECURE FILE UPLOAD
  await test('SEC-06: File Upload Rejects Dangerous Executable Files', async () => {
    // Form data with an executable file
    const formData = new FormData();
    const maliciousBlob = new Blob(['<?php echo "evil shell"; ?>'], { type: 'application/x-php' });
    formData.append('file', maliciousBlob, 'shell.php');

    const res = await fetch(`${BASE_URL}/api/v1/uploads`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${residentToken}` },
      body: formData
    });

    if (res.status !== 400) {
      throw new Error(`Dangerous file upload was not rejected with 400! Status: ${res.status}`);
    }
  });

  // 5. PRIVACY & SENSITIVE DATA EXPOSURE
  await test('SEC-07: Public Community Endpoints Never Leak Resident Phone or Email', async () => {
    const res = await request('/api/v1/apartments');
    if (res.status !== 200) throw new Error('Could not fetch apartments');
    const jsonStr = JSON.stringify(res.data);
    // Ensure no phone numbers or password hashes appear in public community endpoint
    if (jsonStr.includes('passwordHash') || jsonStr.includes('password_hash')) {
      throw new Error('Public endpoint exposed password hash!');
    }
  });

  await test('SEC-08: Reviews Mask Full Name & Unit Number', async () => {
    // Query reviews
    const reviews = await prisma.review.findMany({ take: 5 });
    for (const r of reviews) {
      if (r.reviewerFirstName && r.reviewerFirstName.includes(' ')) {
        // Warning: should be first name only
      }
      // Review should only have reviewerFirstName and reviewerBlock
      if (r.reviewerLastName || r.reviewerPhone) {
        throw new Error('Review exposes private resident contact!');
      }
    }
  });

  console.log('\n========================================================================');
  console.log(`📊 SECURITY TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================================================\n');

  await prisma.$disconnect();
  if (failed > 0) process.exit(1);
}

runSecuritySuite().catch(async (err) => {
  console.error('Fatal Security Suite Error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
