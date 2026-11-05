import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const { searchParams } = new URL(req.url);
    const communityId = searchParams.get('communityId');
    const mine = searchParams.get('mine') === 'true';
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    // If business owner requests their own campaigns
    if (mine && user?.businessProfile) {
      const campaigns = await prisma.businessCampaign.findMany({
        where: {
          businessId: user.businessProfile.id,
          ...(includeDeleted ? {} : { deletedAt: null })
        },
        include: { business: true, auditLogs: true },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ success: true, count: campaigns.length, campaigns });
    }

    // If admin requests all campaigns
    if (user?.role === 'ADMIN') {
      const campaigns = await prisma.businessCampaign.findMany({
        where: includeDeleted ? {} : { deletedAt: null },
        include: { business: true, auditLogs: true },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ success: true, count: campaigns.length, campaigns });
    }

    // Resident / Public view: active, approved, non-deleted campaigns free of charge
    const now = new Date();
    const campaigns = await prisma.businessCampaign.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null, // Strictly exclude soft-deleted campaigns
        startDate: { lte: now },
        endDate: { gte: now }
      },
      include: {
        business: {
          select: {
            id: true,
            businessName: true,
            category: true,
            logoUrl: true,
            contactPhone: true,
            contactEmail: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Filter by apartment community if provided
    let matchedCampaigns = campaigns;
    if (communityId) {
      matchedCampaigns = campaigns.filter((c) => {
        if (!c.targetApartmentsJson) return true;
        try {
          const ids = JSON.parse(c.targetApartmentsJson);
          return Array.isArray(ids) && (ids.length === 0 || ids.includes(communityId));
        } catch {
          return true;
        }
      });
    }

    // Auto increment impression counter for matching campaigns
    if (matchedCampaigns.length > 0) {
      const ids = matchedCampaigns.map((c) => c.id);
      prisma.businessCampaign.updateMany({
        where: { id: { in: ids } },
        data: { impressionsCount: { increment: 1 } }
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, count: matchedCampaigns.length, campaigns: matchedCampaigns });
  } catch (error: any) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user owns a business profile
    const business = await prisma.localBusiness.findUnique({
      where: { userId: user.id }
    });

    if (!business) {
      return NextResponse.json(
        { error: 'You must have an approved local business profile to publish campaigns.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      bannerUrl,
      targetCategory = business.category,
      targetCity = business.city,
      targetLocalities = [],
      targetApartments = [],
      startDate,
      endDate
    } = body;

    if (!title || !description || !bannerUrl || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Campaign title, description, banner URL, start date, and end date are required.' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return NextResponse.json(
        { error: 'Campaign end date must be after start date.' },
        { status: 400 }
      );
    }

    const campaign = await prisma.businessCampaign.create({
      data: {
        businessId: business.id,
        title: title.trim(),
        description: description.trim(),
        bannerUrl: bannerUrl.trim(),
        imageFileName: body.imageFileName || null,
        imageFileSize: body.imageFileSize || null,
        imageMimeType: body.imageMimeType || null,
        targetCategory,
        targetCity,
        targetLocalitiesJson: JSON.stringify(targetLocalities),
        targetApartmentsJson: JSON.stringify(targetApartments),
        startDate: start,
        endDate: end,
        status: 'PENDING_APPROVAL'
      },
      include: { business: true }
    });

    // Record creation in CampaignAuditLog (Requirement 12)
    await prisma.campaignAuditLog.create({
      data: {
        campaignId: campaign.id,
        action: 'CREATED',
        performedById: user.id,
        newStateJson: JSON.stringify({
          title: campaign.title,
          status: campaign.status,
          bannerUrl: campaign.bannerUrl,
          imageFileName: campaign.imageFileName
        }),
        reason: 'New campaign submitted for administrative approval'
      }
    });

    // Notify Platform Admins for review
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'CAMPAIGN_APPROVAL',
          title: 'New Ad Campaign Submitted for Review',
          message: `${business.businessName} submitted campaign "${title}" targeting ${targetApartments.length} societies.`,
          link: '/admin/approvals'
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign submitted successfully. Awaiting platform administration approval.',
      campaign
    });
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
