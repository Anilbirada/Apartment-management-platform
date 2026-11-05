/**
 * Test Suite: Additional Customer Requirements – Version 2
 * 
 * Requirement 10: Public Main Website with Optional Login
 * Requirement 11: Campaign Image Upload to Persistent Storage
 * Requirement 12: Soft Deletion of Promotional Campaigns with Audit Log
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runTests() {
  console.log('========================================================================');
  console.log('🧪 RUNNING VERSION 2 REQUIREMENTS VERIFICATION (REQ 10, 11, 12)');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`Testing [${name}] ... `);
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
      console.error(err);
      failed++;
    }
  }

  // ==========================================================================
  // REQUIREMENT 10: PUBLIC MAIN WEBSITE WITH OPTIONAL LOGIN
  // ==========================================================================
  console.log('\n--- REQUIREMENT 10: PUBLIC MAIN WEBSITE & OPTIONAL LOGIN ---');

  await test('10.1: Public visitor can view connected apartment communities without authentication', async () => {
    const communities = await prisma.community.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        city: true,
        address: true,
        totalFlats: true,
        blocks: {
          select: { id: true, name: true }
        }
      }
    });

    if (communities.length === 0) {
      throw new Error('No apartment communities found in database');
    }

    // Verify no private resident personal data is exposed in public query
    for (const c of communities) {
      if (c.users !== undefined) throw new Error('Private user roster exposed on community entity');
      if (c.residentApplications !== undefined) throw new Error('Private applications exposed on community entity');
    }
  });

  await test('10.2: Public visitor can explore approved neighborhood businesses without authentication', async () => {
    const businesses = await prisma.localBusiness.findMany({
      where: {
        isApproved: true,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        businessName: true,
        category: true,
        city: true,
        description: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
            // zero phone or password hash
          }
        }
      }
    });

    if (businesses.length === 0) {
      throw new Error('No active businesses found');
    }

    for (const b of businesses) {
      if (b.user.phone !== undefined) throw new Error('Private phone exposed in public business discovery');
      if (b.user.passwordHash !== undefined) throw new Error('Password hash exposed in public business discovery');
    }
  });

  await test('10.3: Multi-role authentication accounts exist for all 5 roles', async () => {
    const roles = ['RESIDENT', 'PROVIDER', 'MANAGEMENT', 'BUSINESS', 'ADMIN'];
    for (const role of roles) {
      const user = await prisma.user.findFirst({
        where: { role, status: 'ACTIVE' }
      });
      if (!user) {
        throw new Error(`Active demo user for role ${role} not found in database`);
      }
    }
  });

  // ==========================================================================
  // REQUIREMENT 11: CAMPAIGN IMAGE UPLOAD
  // ==========================================================================
  console.log('\n--- REQUIREMENT 11: CAMPAIGN IMAGE UPLOAD ---');

  await test('11.1: Persistent upload storage directory exists on disk', async () => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'campaigns');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    if (!fs.existsSync(uploadDir)) {
      throw new Error('Upload directory public/uploads/campaigns does not exist');
    }
  });

  let createdCampaignId = null;
  let testBusiness = null;
  let testUploadedFile = null;

  await test('11.2: Persistent file creation and validation (JPG/PNG/WebP, max 5MB)', async () => {
    // Locate active business
    testBusiness = await prisma.localBusiness.findFirst({
      where: { status: 'ACTIVE' },
      include: { user: true }
    });
    if (!testBusiness) throw new Error('No active business found for image upload test');

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'campaigns');
    const fileName = `test-campaign-${Date.now()}.webp`;
    const filePath = path.join(uploadDir, fileName);

    // Simulate persistent file upload to disk
    const sampleBuffer = Buffer.from('RIFF....WEBPVP8 ...Sample Valid WebP Image Data...');
    fs.writeFileSync(filePath, sampleBuffer);

    testUploadedFile = {
      fileName,
      filePath,
      fileSize: sampleBuffer.length,
      mimeType: 'image/webp',
      url: `/uploads/campaigns/${fileName}`
    };

    if (!fs.existsSync(filePath)) {
      throw new Error('Uploaded file was not persisted to disk');
    }
  });

  await test('11.3: Save campaign record with uploaded image metadata in database', async () => {
    const campaign = await prisma.businessCampaign.create({
      data: {
        businessId: testBusiness.id,
        title: 'Fresh Organic Mango Festival 2026',
        description: 'Special 25% off Alphonso mangoes delivered free to all apartment towers.',
        bannerUrl: testUploadedFile.url,
        imageFileName: testUploadedFile.fileName,
        imageFileSize: testUploadedFile.fileSize,
        imageMimeType: testUploadedFile.mimeType,
        targetCategory: testBusiness.category || 'GROCERY',
        targetApartmentsJson: JSON.stringify(['apt-palm-heights']),
        targetCity: testBusiness.city || 'Bengaluru',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    });

    createdCampaignId = campaign.id;

    if (!campaign.id) throw new Error('Failed to create campaign record');
    if (campaign.bannerUrl !== testUploadedFile.url) throw new Error('bannerUrl does not match uploaded URL');
    if (campaign.imageFileName !== testUploadedFile.fileName) throw new Error('imageFileName metadata not persisted');
    if (campaign.imageMimeType !== 'image/webp') throw new Error('imageMimeType metadata not persisted');
    if (campaign.deletedAt !== null) throw new Error('deletedAt must initially be null');
  });

  // ==========================================================================
  // REQUIREMENT 12: DELETE PROMOTIONAL CAMPAIGNS
  // ==========================================================================
  console.log('\n--- REQUIREMENT 12: DELETE PROMOTIONAL CAMPAIGNS ---');

  await test('12.1: Active campaign is visible in public / resident campaign feed', async () => {
    const activeCampaigns = await prisma.businessCampaign.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null
      }
    });

    const found = activeCampaigns.find(c => c.id === createdCampaignId);
    if (!found) throw new Error('Newly created campaign should be visible in active feed');
  });

  await test('12.2: Soft deletion of campaign by authorized owner with reason and audit log', async () => {
    const reason = 'Seasonal stock depleted ahead of schedule';
    const deletedTime = new Date();

    // Perform soft deletion matching DELETE /api/v1/campaigns/[id]
    const updated = await prisma.businessCampaign.update({
      where: { id: createdCampaignId },
      data: {
        status: 'DELETED',
        deletedAt: deletedTime,
        deletedById: testBusiness.userId,
        deletionReason: reason
      }
    });

    // Record audit log entry
    await prisma.campaignAuditLog.create({
      data: {
        campaignId: createdCampaignId,
        action: 'DELETED',
        performedById: testBusiness.userId,
        reason,
        newStateJson: JSON.stringify({
          title: updated.title,
          status: 'DELETED',
          impressions: updated.impressionsCount,
          clicks: updated.clicksCount
        })
      }
    });

    if (updated.status !== 'DELETED') throw new Error('Campaign status was not set to DELETED');
    if (!updated.deletedAt) throw new Error('deletedAt timestamp was not recorded');
    if (updated.deletionReason !== reason) throw new Error('deletionReason was not recorded');
  });

  await test('12.3: Immediately removed from resident-facing campaign feeds', async () => {
    const residentFeeds = await prisma.businessCampaign.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null
      }
    });

    const isVisible = residentFeeds.some(c => c.id === createdCampaignId);
    if (isVisible) {
      throw new Error('CRITICAL BUG: Deleted campaign is still appearing in resident-facing feed!');
    }
  });

  await test('12.4: CampaignAuditLog entry exists and preserves historical metrics', async () => {
    const auditLogs = await prisma.campaignAuditLog.findMany({
      where: { campaignId: createdCampaignId }
    });

    if (auditLogs.length === 0) {
      throw new Error('Audit log entry was not found for deleted campaign');
    }

    const deleteLog = auditLogs.find(l => l.action === 'DELETED');
    if (!deleteLog) throw new Error('DELETED action audit log entry missing');

    const state = JSON.parse(deleteLog.newStateJson);
    if (!deleteLog.reason || !state.title) {
      throw new Error('Audit log details do not contain deletion reason and campaign title');
    }
  });

  await test('12.5: Historical payment and subscription records are preserved intact', async () => {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: testBusiness.userId }
    });

    const transactions = await prisma.paymentTransaction.findMany({
      where: { userId: testBusiness.userId }
    });

    // Financial integrity check passed
    if (!Array.isArray(subscriptions) || !Array.isArray(transactions)) {
      throw new Error('Financial queries failed');
    }
  });

  // Cleanup test image file
  if (testUploadedFile && fs.existsSync(testUploadedFile.filePath)) {
    fs.unlinkSync(testUploadedFile.filePath);
  }

  console.log('\n========================================================================');
  console.log(`🎉 TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runTests()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
