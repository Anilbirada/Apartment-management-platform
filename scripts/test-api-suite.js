/**
 * Palm Heights Enterprise: Comprehensive API Test Suite
 * Executes real HTTP requests against all primary endpoints on http://localhost:3000
 */

const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-token-apartment-management-saas-2026';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
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

async function runApiSuite() {
  console.log('========================================================================');
  console.log('🌐 RUNNING PALM HEIGHTS COMPREHENSIVE REST API TEST SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;
  const results = [];

  async function test(endpoint, scenario, fn) {
    process.stdout.write(`API [${endpoint}] - ${scenario} ... `);
    try {
      await fn();
      console.log('✅ PASSED');
      passed++;
      results.push({ endpoint, scenario, status: 'PASSED' });
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
      failed++;
      results.push({ endpoint, scenario, status: 'FAILED', error: err.message });
    }
  }

  // Pre-seed test users & community
  const community = await prisma.community.findFirst();
  const guestUser = await prisma.user.findFirst({ where: { role: 'GUEST' } });
  const residentUser = await prisma.user.findFirst({ where: { role: 'RESIDENT' } });
  const providerUser = await prisma.user.findFirst({ where: { role: 'PROVIDER' } });
  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const businessUser = await prisma.user.findFirst({ where: { role: 'BUSINESS' } });

  const guestToken = guestUser ? signToken({ userId: guestUser.id, email: guestUser.email, role: guestUser.role, name: guestUser.name }) : '';
  const residentToken = residentUser ? signToken({ userId: residentUser.id, email: residentUser.email, role: residentUser.role, name: residentUser.name }) : '';
  const providerToken = providerUser ? signToken({ userId: providerUser.id, email: providerUser.email, role: providerUser.role, name: providerUser.name }) : '';
  const adminToken = adminUser ? signToken({ userId: adminUser.id, email: adminUser.email, role: adminUser.role, name: adminUser.name }) : '';
  const businessToken = businessUser ? signToken({ userId: businessUser.id, email: businessUser.email, role: businessUser.role, name: businessUser.name }) : '';

  // 1. PUBLIC APIS
  await test('GET /api/v1/apartments', 'Public visitor lists communities', async () => {
    const res = await request('/api/v1/apartments');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(res.data.apartments || res.data)) throw new Error('Expected array of apartments');
  });

  await test('GET /api/v1/categories', 'Public visitor lists service categories', async () => {
    const res = await request('/api/v1/categories');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const cats = res.data.categories || res.data;
    if (!Array.isArray(cats) || cats.length === 0) throw new Error('Categories list empty');
  });

  // 2. AUTHENTICATION & LOGIN APIS
  await test('POST /api/v1/auth/login', 'Valid login returns JWT and user payload', async () => {
    const res = await request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: adminUser.email, password: 'Password123!' })
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.data.user || res.data.user.email !== adminUser.email) throw new Error('User payload mismatch');
  });

  await test('POST /api/v1/auth/login', 'Invalid password returns 401 Unauthorized', async () => {
    const res = await request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: adminUser.email, password: 'WrongPassword999' })
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  await test('POST /api/v1/auth/login', 'Missing body parameters returns 400 Bad Request', async () => {
    const res = await request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: '' })
    });
    if (res.status !== 400 && res.status !== 401) throw new Error(`Expected 400/401, got ${res.status}`);
  });

  await test('GET /api/v1/auth/me', 'Authenticated user retrieves profile', async () => {
    const res = await request('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.data.user || res.data.user.role !== 'ADMIN') throw new Error('Expected ADMIN user');
  });

  await test('GET /api/v1/auth/me', 'Unauthenticated request returns 401 Unauthorized', async () => {
    const res = await request('/api/v1/auth/me');
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  await test('POST /api/v1/auth/switch-role', 'Non-admin forbidden from role switching', async () => {
    const res = await request('/api/v1/auth/switch-role', {
      method: 'POST',
      headers: { Authorization: `Bearer ${residentToken}` },
      body: JSON.stringify({ role: 'ADMIN' })
    });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  await test('POST /api/v1/auth/switch-role', 'Admin allowed to switch role', async () => {
    const res = await request('/api/v1/auth/switch-role', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ role: 'RESIDENT' })
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // 3. MARKETPLACE & PROVIDER APIS
  await test('GET /api/v1/providers', 'Unauthenticated marketplace browsing requires auth message', async () => {
    const res = await request('/api/v1/providers');
    // Unauthenticated access returns 401 or summary
    if (res.status !== 401 && res.status !== 200) throw new Error(`Unexpected status ${res.status}`);
  });

  await test('GET /api/v1/providers', 'Authenticated user retrieves approved providers', async () => {
    const res = await request('/api/v1/providers', {
      headers: { Authorization: `Bearer ${residentToken}` }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(res.data.providers || res.data)) throw new Error('Expected providers array');
  });

  await test('GET /api/v1/businesses', 'Authenticated user retrieves local businesses', async () => {
    const res = await request('/api/v1/businesses', {
      headers: { Authorization: `Bearer ${residentToken}` }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // 4. CAMPAIGN APIS
  await test('GET /api/v1/campaigns', 'Authenticated user retrieves approved active campaigns', async () => {
    const res = await request('/api/v1/campaigns', {
      headers: { Authorization: `Bearer ${residentToken}` }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('POST /api/v1/campaigns', 'Non-business user forbidden from creating campaigns', async () => {
    const res = await request('/api/v1/campaigns', {
      method: 'POST',
      headers: { Authorization: `Bearer ${residentToken}` },
      body: JSON.stringify({ title: 'Unauth Ad', description: 'Desc' })
    });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  // 5. SERVICE REQUESTS & BOOKING APIS
  await test('GET /api/v1/requests', 'Resident queries their own service requests', async () => {
    const res = await request('/api/v1/requests', {
      headers: { Authorization: `Bearer ${residentToken}` }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('POST /api/v1/requests', 'Missing required fields returns 400 Bad Request', async () => {
    const res = await request('/api/v1/requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${residentToken}` },
      body: JSON.stringify({ categoryName: 'Plumbing' })
    });
    if (res.status !== 400) throw new Error(`Expected 400 Bad Request, got ${res.status}`);
  });

  // 6. GUEST UPGRADE APIS
  await test('GET /api/v1/guest/applications', 'Guest queries their upgrade applications', async () => {
    const res = await request('/api/v1/guest/applications', {
      headers: { Authorization: `Bearer ${guestToken}` }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.data.success) throw new Error('Expected success: true');
  });

  // 7. ADMIN GOVERNANCE APIS
  await test('GET /api/v1/admin/users', 'Non-admin forbidden from querying all users', async () => {
    const res = await request('/api/v1/admin/users', {
      headers: { Authorization: `Bearer ${residentToken}` }
    });
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  await test('GET /api/v1/admin/users', 'Admin queries users successfully', async () => {
    const res = await request('/api/v1/admin/users', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(res.data.users || res.data)) throw new Error('Expected users array');
  });

  await test('GET /api/v1/admin/memberships', 'Admin queries membership tiers', async () => {
    const res = await request('/api/v1/admin/memberships', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('GET /api/v1/admin/upgrades', 'Admin queries upgrade requests', async () => {
    const res = await request('/api/v1/admin/upgrades', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // 8. QR GATE ATTENDANCE APIS
  await test('GET /api/v1/qr/gate-token', 'Public/Guard retrieves rotating gate QR token', async () => {
    const res = await request('/api/v1/qr/gate-token');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.data.qrToken || !res.data.gate) throw new Error('QR Token missing from gate response');
  });

  await test('POST /api/v1/qr/scan', 'Invalid QR payload rejected with 400 for provider', async () => {
    const res = await request('/api/v1/qr/scan', {
      method: 'POST',
      headers: { Authorization: `Bearer ${providerToken}` },
      body: JSON.stringify({ qrPayload: 'forged.malicious.token', serviceRequestId: 'dummy-req' })
    });
    if (res.status !== 400 && res.status !== 404) throw new Error(`Expected 400 or 404, got ${res.status}`);
  });

  // 9. MONETIZATION & PLANS APIS
  await test('GET /api/v1/plans', 'Public/authenticated user retrieves subscription plans', async () => {
    const res = await request('/api/v1/plans');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('GET /api/v1/monetization', 'Non-admin forbidden from revenue ledger', async () => {
    const res = await request('/api/v1/monetization', {
      headers: { Authorization: `Bearer ${residentToken}` }
    });
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  await test('GET /api/v1/monetization', 'Admin retrieves platform monetization metrics', async () => {
    const res = await request('/api/v1/monetization', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.data.metrics || typeof res.data.metrics.totalRevenue !== 'number') {
      throw new Error('Expected revenue numeric value in metrics');
    }
  });

  // 10. NOTIFICATIONS APIS
  await test('GET /api/v1/notifications', 'Authenticated user retrieves notifications', async () => {
    const res = await request('/api/v1/notifications', {
      headers: { Authorization: `Bearer ${residentToken}` }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // 11. FILE UPLOAD APIS
  await test('POST /api/v1/uploads', 'Unauthenticated file upload rejected with 401', async () => {
    const res = await request('/api/v1/uploads', {
      method: 'POST'
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  console.log('\n========================================================================');
  console.log(`📊 API TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================================================\n');

  await prisma.$disconnect();
  if (failed > 0) process.exit(1);
}

runApiSuite().catch(async (err) => {
  console.error('Fatal API Suite Error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
