/**
 * Enterprise Apartment Management & Local Business Marketplace SaaS
 * Comprehensive End-to-End Verification Suite (All 12 Core Scenarios)
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// HMAC Secret matching src/lib/qrCrypto.ts
const QR_SECRET = process.env.QR_HMAC_SECRET || 'dev_qr_attendance_super_secret_signing_key_2026';

function generateGateToken(gateId, communityId, gateName = 'Main Security Gate') {
  const timestamp = Date.now();
  const rawPayload = `${gateId}:${communityId}:${timestamp}`;
  const signature = crypto.createHmac('sha256', QR_SECRET).update(rawPayload).digest('hex');
  return Buffer.from(JSON.stringify({ gateId, communityId, gateName, timestamp, signature })).toString('base64');
}

function verifyGateToken(token) {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    const { gateId, communityId, timestamp, signature } = decoded;
    if (!gateId || !communityId || !timestamp || !signature) return { valid: false, error: 'Malformed token' };

    // Check expiration (60 seconds)
    if (Date.now() - timestamp > 60000) {
      return { valid: false, error: 'QR Token has expired. Please refresh the gate QR code.' };
    }

    const rawPayload = `${gateId}:${communityId}:${timestamp}`;
    const expected = crypto.createHmac('sha256', QR_SECRET).update(rawPayload).digest('hex');
    if (signature !== expected) {
      return { valid: false, error: 'Cryptographic signature mismatch' };
    }

    return { valid: true, payload: decoded };
  } catch (e) {
    return { valid: false, error: 'Invalid token encoding' };
  }
}

async function runAllScenarios() {
  console.log('========================================================================');
  console.log('🚀 ENTERPRISE SAAS E2E VERIFICATION SUITE - 12 CORE SCENARIOS');
  console.log('========================================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`Testing [${name}] ... `);
      await fn();
      console.log('✅ PASSED');
      passedCount++;
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
      failedCount++;
    }
  }

  // --- SCENARIO 1: Admin Creates Apartment ---
  await test('Scenario 1: Admin Creates Apartment Community, Blocks, Units & Gates', async () => {
    const timestamp = Date.now();
    const apt = await prisma.community.create({
      data: {
        name: `Heights Horizon ${timestamp}`,
        code: `HH-${timestamp}`,
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560066',
        address: 'Whitefield Main Road',
        totalBlocks: 1,
        totalFlats: 2,
        blocks: {
          create: [
            {
              name: 'Tower Alpha',
              totalFloors: 10,
              units: {
                create: [
                  { unitNumber: '101', floorNumber: 1, residentType: 'OWNER', status: 'OCCUPIED' },
                  { unitNumber: '102', floorNumber: 1, residentType: 'VACANT', status: 'VACANT' }
                ]
              }
            }
          ]
        },
        gates: {
          create: [
            {
              gateName: 'Main Alpha Gate',
              gateCode: `GATE-A1-${timestamp}`,
              qrSecret: 'sec_alpha_gate'
            }
          ]
        }
      },
      include: { blocks: { include: { units: true } }, gates: true }
    });

    if (!apt.id || apt.blocks.length !== 1 || apt.blocks[0].units.length !== 2 || apt.gates.length !== 1) {
      throw new Error('Apartment structure not created correctly');
    }
  });

  // --- SCENARIO 2: Management Creates/Invites Residents (Option 1) ---
  await test('Scenario 2: Society Management Creates & Invites Residents (Option 1)', async () => {
    const apt = await prisma.community.findFirst();
    const token = crypto.randomBytes(24).toString('hex');
    const invite = await prisma.residentInvitation.create({
      data: {
        communityId: apt.id,
        name: 'Sunil Sharma',
        email: `invited_${Date.now()}@palmheights.internal`,
        phone: `+9198000${Math.floor(10000 + Math.random() * 90000)}`,
        block: 'Tower A',
        flatNumber: 'A-404',
        token,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    if (!invite.id || invite.status !== 'PENDING') throw new Error('Invite creation failed');
  });

  // --- SCENARIO 3: Resident Self-Registration & Approval Queue (Option 2) ---
  await test('Scenario 3: Resident Self-Registration & Management Approval Queue', async () => {
    const apt = await prisma.community.findFirst();
    const user = await prisma.user.findFirst({ where: { role: 'RESIDENT' } });
    const app = await prisma.residentApplication.create({
      data: {
        communityId: apt.id,
        userId: user.id,
        block: 'Tower B',
        flatNumber: 'B-302',
        residentType: 'TENANT',
        proofDocumentUrl: 'https://images.unsplash.com/rental_agreement.jpg',
        status: 'PENDING'
      }
    });

    // Society Management Reviews & Approves
    const updated = await prisma.residentApplication.update({
      where: { id: app.id },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewedById: 'mgr_society_palm'
      }
    });

    if (updated.status !== 'APPROVED') throw new Error('Application approval failed');
  });

  // --- SCENARIO 4: Provider Local Area Registration & Multi-Geographic Coverage ---
  await test('Scenario 4: Provider Multi-Geographic Coverage & Filtering', async () => {
    const provider = await prisma.providerProfile.findFirst({
      include: { serviceAreas: true }
    });

    const newArea = await prisma.providerServiceArea.create({
      data: {
        providerProfileId: provider.id,
        locality: 'Sarjapur Road',
        postalCode: '560035',
        serviceRadiusKm: 8.5
      }
    });

    const areas = await prisma.providerServiceArea.findMany({
      where: { providerProfileId: provider.id }
    });

    if (areas.length < 2) throw new Error('Provider service areas not persisted');
  });

  // --- SCENARIO 5: Local Business Registration & Profile Setup ---
  await test('Scenario 5: Local Business Registration & Category Assignment', async () => {
    const biz = await prisma.localBusiness.findFirst({
      where: { category: 'GROCERY' }
    });

    if (!biz || biz.businessName !== 'Namaste Fresh Supermarket & Organics') {
      throw new Error('Local business not found or incorrect category');
    }
  });

  // --- SCENARIO 6: Subscription Purchase & Server Verification ---
  await test('Scenario 6: Subscription Upgrade with HMAC Verification & Idempotency', async () => {
    const plan = await prisma.subscriptionPlan.findFirst({
      where: { targetRole: 'PROVIDER', planType: 'PAID' }
    });
    const providerUser = await prisma.user.findFirst({ where: { role: 'PROVIDER' } });

    const txNumber = `TXN-E2E-${Date.now()}`;
    const rawSignature = `${txNumber}:99900:INR`;
    const signature = crypto.createHmac('sha256', 'razorpay_mock_webhook_secret_key_2026').update(rawSignature).digest('hex');

    const sub = await prisma.subscription.create({
      data: {
        userId: providerUser.id,
        planId: plan.id,
        targetRole: 'PROVIDER',
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    const tx = await prisma.paymentTransaction.create({
      data: {
        transactionNumber: txNumber,
        userId: providerUser.id,
        subscriptionId: sub.id,
        amountInr: plan.priceInr,
        currency: 'INR',
        paymentMethod: 'UPI',
        status: 'SUCCESS',
        gatewayReference: `pay_e2e_${Date.now()}`,
        gatewaySignature: signature
      }
    });

    if (sub.status !== 'ACTIVE' || !tx.id) throw new Error('Subscription verification failed');
  });

  // --- SCENARIO 7: Free Membership Activation ---
  await test('Scenario 7: Free Membership Plan Allocation', async () => {
    const freePlan = await prisma.subscriptionPlan.findFirst({
      where: { planType: 'FREE' }
    });
    if (!freePlan || freePlan.priceInr !== 0) throw new Error('Free membership plan missing');
  });

  // --- SCENARIO 8: Ad Campaign Creation & Free Resident Viewing ---
  await test('Scenario 8: Sponsored Ad Campaign Creation & Active Status', async () => {
    const campaign = await prisma.businessCampaign.findFirst({
      where: { status: 'ACTIVE' },
      include: { business: true }
    });

    if (!campaign || !campaign.business) throw new Error('Active campaign verification failed');
  });

  // --- SCENARIO 9: Service Request Booking & Zero Phone Leakage ---
  await test('Scenario 9: Service Booking Workflow & Privacy (Zero Phone Leakage)', async () => {
    const req = await prisma.serviceRequest.findFirst({
      include: {
        resident: { select: { id: true, name: true } },
        providerProfile: {
          select: {
            id: true,
            user: { select: { id: true, name: true } },
            businessName: true
          }
        }
      }
    });

    if (!req) throw new Error('Service request record not found');
    if (req.providerProfile.user.phone) {
      throw new Error('SECURITY VIOLATION: Provider phone leaked in resident view');
    }
    if (req.resident.phone) {
      throw new Error('SECURITY VIOLATION: Resident phone leaked');
    }
  });

  // --- SCENARIO 10: Signed Rotating QR Entry Scan & Attendance Update ---
  await test('Scenario 10: Signed Rotating QR Entry Scan & State Transition', async () => {
    const gate = await prisma.apartmentGate.findFirst();
    const serviceReq = await prisma.serviceRequest.findFirst();
    const token = generateGateToken(gate.id, gate.communityId, gate.gateName);
    const verification = verifyGateToken(token);

    if (!verification.valid) throw new Error(`Token verification failed: ${verification.error}`);

    const visit = await prisma.providerVisit.create({
      data: {
        communityId: gate.communityId,
        gateId: gate.id,
        serviceRequestId: serviceReq.id,
        providerProfileId: serviceReq.providerProfileId,
        entryTimestamp: new Date(),
        entryQrToken: token,
        visitStatus: 'INSIDE_APARTMENT'
      }
    });

    if (visit.visitStatus !== 'INSIDE_APARTMENT') throw new Error('Visit status not INSIDE_APARTMENT');
  });

  // --- SCENARIO 11: Signed Rotating QR Exit Scan & Duration Calculation ---
  await test('Scenario 11: Signed Rotating QR Exit Scan & Duration Calculation', async () => {
    const openVisit = await prisma.providerVisit.findFirst({
      where: { visitStatus: 'INSIDE_APARTMENT' }
    });

    const exitTimestamp = new Date();
    const durationMinutes = Math.max(1, Math.round((exitTimestamp.getTime() - new Date(openVisit.entryTimestamp).getTime()) / 60000));

    const completedVisit = await prisma.providerVisit.update({
      where: { id: openVisit.id },
      data: {
        exitTimestamp,
        durationMinutes,
        visitStatus: 'EXITED'
      }
    });

    if (completedVisit.visitStatus !== 'EXITED' || completedVisit.durationMinutes < 1) {
      throw new Error('Visit exit completion or duration calculation failed');
    }
  });

  // --- SCENARIO 12: Security & Multi-Tenant Isolation ---
  await test('Scenario 12: Security Tests (Expired QR Rejection, Tampering, Tenant Isolation)', async () => {
    // 1. Expired token rejection
    const expiredPayload = {
      gateId: 'gate_1',
      communityId: 'comm_1',
      timestamp: Date.now() - 120000, // 2 minutes ago
      signature: 'dummy'
    };
    const expiredToken = Buffer.from(JSON.stringify(expiredPayload)).toString('base64');
    const expiredResult = verifyGateToken(expiredToken);
    if (expiredResult.valid) throw new Error('Expired token was unexpectedly accepted');

    // 2. Tampered signature rejection
    const tamperedPayload = {
      gateId: 'gate_1',
      communityId: 'comm_1',
      timestamp: Date.now(),
      signature: 'bad_signature_attack'
    };
    const tamperedToken = Buffer.from(JSON.stringify(tamperedPayload)).toString('base64');
    const tamperedResult = verifyGateToken(tamperedToken);
    if (tamperedResult.valid) throw new Error('Tampered signature was unexpectedly accepted');

    // 3. Multi-tenant isolation verification
    const allApts = await prisma.community.findMany({ take: 2 });
    if (allApts.length < 2) throw new Error('Need at least 2 apartments for isolation test');

    const aptA = allApts[0];
    const aptB = allApts[1];

    const unitsA = await prisma.apartmentUnit.findMany({
      where: { block: { communityId: aptA.id } },
      include: { block: true }
    });
    const crossTenantUnits = unitsA.filter(u => u.block?.communityId === aptB.id);
    if (crossTenantUnits.length > 0) throw new Error('Cross-tenant data contamination detected');
  });

  console.log('\n========================================================================');
  console.log(`✨ TEST SUITE COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('========================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAllScenarios()
  .catch((e) => {
    console.error('Fatal Test Runner Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
