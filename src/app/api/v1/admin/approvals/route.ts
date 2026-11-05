import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGEMENT')) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    // 1. Pending Providers
    const pendingProviders = await prisma.providerProfile.findMany({
      where: {
        OR: [
          { isApproved: false },
          { verificationStatus: 'PENDING' }
        ]
      },
      include: {
        user: true,
        documents: true,
        listings: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // 2. Pending Listings
    const pendingListings = await prisma.serviceListing.findMany({
      where: { status: 'PENDING_APPROVAL' },
      include: {
        providerProfile: { include: { user: true } },
        category: true,
        subCategory: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // 3. Pending Local Businesses
    const pendingBusinesses = await prisma.localBusiness.findMany({
      where: { verificationStatus: 'PENDING' },
      include: {
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // 4. Pending Advertising Campaigns
    const pendingCampaigns = await prisma.businessCampaign.findMany({
      where: { status: 'PENDING_APPROVAL' },
      include: {
        business: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // 5. Reported Content
    const reports = await prisma.report.findMany({
      where: { status: 'PENDING' },
      include: {
        reporter: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Summary stats
    const stats = {
      pendingProvidersCount: pendingProviders.length,
      pendingListingsCount: pendingListings.length,
      pendingBusinessesCount: pendingBusinesses.length,
      pendingCampaignsCount: pendingCampaigns.length,
      pendingReportsCount: reports.length,
      totalUsersCount: await prisma.user.count(),
      totalRequestsCount: await prisma.serviceRequest.count(),
      totalCompletedJobs: await prisma.serviceRequest.count({ where: { status: { in: ['COMPLETED', 'REVIEWED'] } } })
    };

    return NextResponse.json({
      success: true,
      stats,
      pendingProviders,
      pendingListings,
      pendingBusinesses,
      pendingCampaigns,
      reports
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGEMENT')) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const {
      targetType, // 'PROVIDER' | 'LISTING' | 'REPORT' | 'BUSINESS' | 'CAMPAIGN'
      targetId,
      action, // 'APPROVE' | 'REJECT' | 'RESOLVE' | 'DISMISS'
      reason
    } = await req.json();

    if (!targetType || !targetId || !action) {
      return NextResponse.json({ error: 'Target type, target ID, and action are required' }, { status: 400 });
    }

    if (action === 'REJECT' && !reason) {
      return NextResponse.json({ error: 'A mandatory rejection reason is required' }, { status: 400 });
    }

    if (targetType === 'PROVIDER') {
      const isApprove = action === 'APPROVE';
      const updated = await prisma.providerProfile.update({
        where: { id: targetId },
        data: {
          isApproved: isApprove,
          verificationStatus: isApprove ? 'APPROVED' : 'REJECTED',
          approvalNotes: reason || (isApprove ? 'Approved by Admin Vikramaditya Rao' : null)
        },
        include: { user: true }
      });

      await prisma.user.update({
        where: { id: updated.userId },
        data: { isVerified: isApprove }
      });

      await prisma.providerDocument.updateMany({
        where: { providerProfileId: targetId },
        data: { status: isApprove ? 'APPROVED' : 'REJECTED' }
      });

      if (isApprove) {
        await prisma.serviceListing.updateMany({
          where: { providerProfileId: targetId, status: 'PENDING_APPROVAL' },
          data: { status: 'PUBLISHED' }
        });
      }

      await prisma.adminApproval.create({
        data: {
          targetType: 'PROVIDER_PROFILE',
          targetId,
          adminId: user.id,
          decision: isApprove ? 'APPROVED' : 'REJECTED',
          reason: reason || null
        }
      });

      await prisma.notification.create({
        data: {
          userId: updated.userId,
          type: 'PROVIDER_APPROVAL',
          title: isApprove ? '🎉 Provider Profile Approved!' : 'Provider Profile Verification Update',
          message: isApprove
            ? 'Your provider profile and documents have been approved by society administration. Your listings are now active!'
            : `Your verification request was declined. Reason: ${reason}`,
          link: '/provider/dashboard'
        }
      });

      return NextResponse.json({ success: true, message: `Provider ${isApprove ? 'approved' : 'rejected'}` });
    }

    if (targetType === 'BUSINESS') {
      const isApprove = action === 'APPROVE';
      const updated = await prisma.localBusiness.update({
        where: { id: targetId },
        data: {
          isApproved: isApprove,
          verificationStatus: isApprove ? 'APPROVED' : 'REJECTED',
          status: isApprove ? 'ACTIVE' : 'SUSPENDED'
        },
        include: { user: true }
      });

      await prisma.user.update({
        where: { id: updated.userId },
        data: { isVerified: isApprove }
      });

      await prisma.adminApproval.create({
        data: {
          targetType: 'LOCAL_BUSINESS',
          targetId,
          adminId: user.id,
          decision: isApprove ? 'APPROVED' : 'REJECTED',
          reason: reason || null
        }
      });

      await prisma.notification.create({
        data: {
          userId: updated.userId,
          type: 'PROVIDER_APPROVAL',
          title: isApprove ? '🎉 Local Business Profile Approved!' : 'Business Profile Status Update',
          message: isApprove
            ? `Your business "${updated.businessName}" has been verified and listed in the community directory.`
            : `Your business application was not approved. Reason: ${reason}`,
          link: '/business/dashboard'
        }
      });

      return NextResponse.json({ success: true, message: `Business ${isApprove ? 'approved' : 'rejected'}` });
    }

    if (targetType === 'CAMPAIGN') {
      const isApprove = action === 'APPROVE';
      const updated = await prisma.businessCampaign.update({
        where: { id: targetId },
        data: {
          status: isApprove ? 'ACTIVE' : 'REJECTED',
          rejectionReason: !isApprove ? reason : null,
          approvedById: user.id,
          approvedAt: new Date()
        },
        include: { business: true }
      });

      await prisma.adminApproval.create({
        data: {
          targetType: 'BUSINESS_CAMPAIGN',
          targetId,
          adminId: user.id,
          decision: isApprove ? 'APPROVED' : 'REJECTED',
          reason: reason || null
        }
      });

      await prisma.notification.create({
        data: {
          userId: updated.business.userId,
          type: 'CAMPAIGN_APPROVAL',
          title: isApprove ? '🚀 Promotional Campaign Approved & Active!' : 'Campaign Review Update',
          message: isApprove
            ? `Your campaign "${updated.title}" is now displaying to apartment residents free of charge.`
            : `Your campaign "${updated.title}" was not approved. Reason: ${reason}`,
          link: '/business/dashboard'
        }
      });

      return NextResponse.json({ success: true, message: `Campaign ${isApprove ? 'approved' : 'rejected'}` });
    }

    if (targetType === 'LISTING') {
      const isApprove = action === 'APPROVE';
      const updated = await prisma.serviceListing.update({
        where: { id: targetId },
        data: {
          status: isApprove ? 'PUBLISHED' : 'CLOSED',
          approvalNotes: reason || (isApprove ? 'Listing approved for community directory' : null)
        },
        include: {
          providerProfile: { include: { user: true } }
        }
      });

      await prisma.adminApproval.create({
        data: {
          targetType: 'SERVICE_LISTING',
          targetId,
          adminId: user.id,
          decision: isApprove ? 'APPROVED' : 'REJECTED',
          reason: reason || null
        }
      });

      await prisma.notification.create({
        data: {
          userId: updated.providerProfile.user.id,
          type: 'LISTING_APPROVAL',
          title: isApprove ? 'Listing Approved & Published' : 'Listing Review Update',
          message: isApprove
            ? `Your service listing "${updated.title}" is now published and visible to residents.`
            : `Your listing "${updated.title}" was not approved. Reason: ${reason}`,
          link: '/provider/dashboard'
        }
      });

      return NextResponse.json({ success: true, message: `Listing ${isApprove ? 'approved' : 'rejected'}` });
    }

    if (targetType === 'REPORT') {
      const status = action === 'RESOLVE' ? 'RESOLVED' : 'DISMISSED';
      await prisma.report.update({
        where: { id: targetId },
        data: {
          status,
          resolutionNotes: reason || 'Handled by administration moderation team.'
        }
      });

      return NextResponse.json({ success: true, message: `Report marked as ${status}` });
    }

    return NextResponse.json({ error: 'Unsupported target type' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin approval error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
