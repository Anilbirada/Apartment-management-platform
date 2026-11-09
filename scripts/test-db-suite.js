/**
 * Palm Heights Enterprise: Comprehensive Database Integrity Test Suite
 * Tests relational schema, foreign key constraints, uniqueness, cascade rules, and persistence.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function runDbSuite() {
  console.log('========================================================================');
  console.log('💾 RUNNING PALM HEIGHTS DATABASE INTEGRITY & SCHEMA TEST SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    process.stdout.write(`DB [${name}] ... `);
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
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 1. UNIQUE CONSTRAINT TESTS
  await test('Unique User Email Constraint', async () => {
    const email = `db_unique_email_${runId}@palmheights.internal`;
    await prisma.user.create({
      data: {
        email,
        name: 'Email Test 1',
        phone: `+91910000${runId % 10000}`,
        passwordHash: hashedPassword,
        role: 'RESIDENT'
      }
    });

    try {
      await prisma.user.create({
        data: {
          email, // Duplicate email
          name: 'Email Test 2',
          phone: `+91910001${runId % 10000}`,
          passwordHash: hashedPassword,
          role: 'RESIDENT'
        }
      });
      throw new Error('Database allowed duplicate user email!');
    } catch (err) {
      if (!err.message.includes('Unique constraint failed') && !err.code?.includes('P2002')) {
        throw err;
      }
    }
  });

  await test('Unique User Phone Constraint', async () => {
    const phone = `+91920000${runId % 10000}`;
    await prisma.user.create({
      data: {
        email: `db_phone_1_${runId}@palmheights.internal`,
        name: 'Phone Test 1',
        phone,
        passwordHash: hashedPassword,
        role: 'RESIDENT'
      }
    });

    try {
      await prisma.user.create({
        data: {
          email: `db_phone_2_${runId}@palmheights.internal`,
          name: 'Phone Test 2',
          phone, // Duplicate phone
          passwordHash: hashedPassword,
          role: 'RESIDENT'
        }
      });
      throw new Error('Database allowed duplicate user phone!');
    } catch (err) {
      if (!err.message.includes('Unique constraint failed') && !err.code?.includes('P2002')) {
        throw err;
      }
    }
  });

  // 2. RELATIONAL INTEGRITY & CASCADE RULES
  await test('Community -> Block -> Unit Relational Hierarchy & Cascade', async () => {
    const comm = await prisma.community.create({
      data: {
        name: `Cascade Test Community ${runId}`,
        code: `COMM-CASC-${runId}`,
        address: '100 Cascade St',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560100',
        totalFlats: 10
      }
    });

    const block = await prisma.apartmentBlock.create({
      data: {
        communityId: comm.id,
        name: 'Block Alpha',
        code: 'A',
        totalFloors: 5
      }
    });

    const unit = await prisma.apartmentUnit.create({
      data: {
        blockId: block.id,
        unitNumber: 'A-101',
        floorNumber: 1
      }
    });

    // Check unique unit number per block
    try {
      await prisma.apartmentUnit.create({
        data: {
          blockId: block.id,
          unitNumber: 'A-101', // duplicate in same block
          floorNumber: 1
        }
      });
      throw new Error('Database allowed duplicate unit in same block!');
    } catch (err) {
      if (!err.message.includes('Unique constraint failed') && !err.code?.includes('P2002')) {
        throw err;
      }
    }

    // Cascade delete community should cleanly delete block and units
    await prisma.community.delete({ where: { id: comm.id } });
    const remainingBlock = await prisma.apartmentBlock.findUnique({ where: { id: block.id } });
    const remainingUnit = await prisma.apartmentUnit.findUnique({ where: { id: unit.id } });
    if (remainingBlock || remainingUnit) {
      throw new Error('Cascade delete failed on community deletion');
    }
  });

  // 3. PERSISTENCE & MUTATION TRACKING
  await test('Profile Mutations & Persistent State Verification', async () => {
    const user = await prisma.user.create({
      data: {
        email: `persist_test_${runId}@palmheights.internal`,
        name: 'Persistent User',
        phone: `+91930000${runId % 10000}`,
        passwordHash: hashedPassword,
        role: 'GUEST',
        status: 'ACTIVE'
      }
    });

    // Mutate
    await prisma.user.update({
      where: { id: user.id },
      data: { name: 'Persistent User Renamed', status: 'ACTIVE' }
    });

    // Re-query directly
    const reloaded = await prisma.user.findUnique({ where: { id: user.id } });
    if (!reloaded || reloaded.name !== 'Persistent User Renamed') {
      throw new Error('Database update mutation did not persist');
    }
  });

  // 4. SOFT DELETION & AUDIT LEDGER PRESERVATION
  await test('Soft Deletion Preserves Audit Logs & Payment History', async () => {
    const bizUser = await prisma.user.create({
      data: {
        email: `biz_audit_${runId}@palmheights.internal`,
        name: 'Audit Biz User',
        phone: `+91940000${runId % 10000}`,
        passwordHash: hashedPassword,
        role: 'BUSINESS',
        businessProfile: {
          create: {
            businessName: `Audit Cafe ${runId}`,
            category: 'RESTAURANT',
            description: 'Audit Test Cafe',
            address: 'Audit Street',
            contactPhone: '+919400001111',
            contactEmail: `cafe_${runId}@audit.com`,
            isApproved: true,
            status: 'ACTIVE'
          }
        }
      },
      include: { businessProfile: true }
    });

    // Create campaign
    const campaign = await prisma.businessCampaign.create({
      data: {
        businessId: bizUser.businessProfile.id,
        title: 'Audit Campaign',
        description: 'Testing soft delete',
        bannerUrl: '/uploads/sample.jpg',
        targetCategory: 'RESTAURANT',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        status: 'ACTIVE'
      }
    });

    // Create Payment
    const payment = await prisma.paymentTransaction.create({
      data: {
        transactionNumber: `TXN-AUDIT-${runId}`,
        userId: bizUser.id,
        campaignId: campaign.id,
        amountInr: 1500,
        currency: 'INR',
        status: 'SUCCESS',
        paymentMethod: 'UPI'
      }
    });

    // Soft delete campaign
    await prisma.businessCampaign.update({
      where: { id: campaign.id },
      data: {
        deletedAt: new Date(),
        status: 'DELETED',
        deletionReason: 'User deleted via dashboard'
      }
    });

    // Record audit log
    await prisma.campaignAuditLog.create({
      data: {
        campaignId: campaign.id,
        action: 'CAMPAIGN_DELETED',
        performedById: bizUser.id,
        reason: 'User deleted via dashboard'
      }
    });

    // Verify campaign is marked deleted but record still exists in DB
    const checkCampaign = await prisma.businessCampaign.findUnique({ where: { id: campaign.id } });
    if (!checkCampaign || checkCampaign.deletedAt === null || checkCampaign.status !== 'DELETED') {
      throw new Error('Soft deletion metadata was not properly saved');
    }

    // Verify payment transaction remains untouched
    const checkPayment = await prisma.paymentTransaction.findUnique({ where: { id: payment.id } });
    if (!checkPayment || checkPayment.status !== 'SUCCESS' || checkPayment.amountInr !== 1500) {
      throw new Error('Payment ledger was corrupted upon campaign deletion');
    }

    // Verify audit log exists
    const checkAudit = await prisma.campaignAuditLog.findFirst({ where: { campaignId: campaign.id } });
    if (!checkAudit || checkAudit.action !== 'CAMPAIGN_DELETED') {
      throw new Error('Campaign audit log missing');
    }
  });

  console.log('\n========================================================================');
  console.log(`📊 DATABASE TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================================================\n');

  await prisma.$disconnect();
  if (failed > 0) process.exit(1);
}

runDbSuite().catch(async (err) => {
  console.error('Fatal DB Suite Error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
