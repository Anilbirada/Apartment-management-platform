import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const campaign = await prisma.businessCampaign.findUnique({
      where: { id },
      include: {
        business: true
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    const { id } = params;
    const body = await req.json();
    const { action, status, reason } = body;

    const campaign = await prisma.businessCampaign.findUnique({
      where: { id },
      include: { business: true }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Public click tracking action (no auth strictly required for click tracking)
    if (action === 'CLICK') {
      const updated = await prisma.businessCampaign.update({
        where: { id },
        data: { clicksCount: { increment: 1 } }
      });
      return NextResponse.json({ success: true, clicksCount: updated.clicksCount });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isBusinessOwner = user.businessProfile && user.businessProfile.id === campaign.businessId;
    const isAdmin = user.role === 'ADMIN';

    if (!isBusinessOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden. You do not own this campaign.' }, { status: 403 });
    }

    // Handle Admin Approvals
    if (action === 'APPROVE' && isAdmin) {
      const updated = await prisma.businessCampaign.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          approvedById: user.id,
          approvedAt: new Date()
        }
      });

      // Notify business owner
      await prisma.notification.create({
        data: {
          userId: campaign.business.userId,
          type: 'CAMPAIGN_APPROVAL',
          title: 'Campaign Approved! 🚀',
          message: `Your ad campaign "${campaign.title}" is now active and displaying to targeted apartment residents free of charge.`,
          link: '/business/dashboard'
        }
      });

      return NextResponse.json({ success: true, message: 'Campaign approved and published.', campaign: updated });
    }

    if (action === 'REJECT' && isAdmin) {
      if (!reason?.trim()) {
        return NextResponse.json({ error: 'A mandatory rejection reason is required.' }, { status: 400 });
      }

      const updated = await prisma.businessCampaign.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectionReason: reason.trim(),
          approvedById: user.id,
          approvedAt: new Date()
        }
      });

      await prisma.notification.create({
        data: {
          userId: campaign.business.userId,
          type: 'CAMPAIGN_APPROVAL',
          title: 'Campaign Requires Modifications',
          message: `Your campaign "${campaign.title}" was not approved. Reason: ${reason.trim()}`,
          link: '/business/dashboard'
        }
      });

      return NextResponse.json({ success: true, message: 'Campaign rejected with feedback.', campaign: updated });
    }

    // Handle Pause / Resume by business owner or admin
    if (status === 'PAUSED' || status === 'ACTIVE') {
      const updated = await prisma.businessCampaign.update({
        where: { id },
        data: { status }
      });
      return NextResponse.json({ success: true, message: `Campaign status changed to ${status}.`, campaign: updated });
    }

    return NextResponse.json({ error: 'Invalid action or insufficient permissions.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required to delete campaigns.' }, { status: 401 });
    }

    const { id } = params;
    let reason = 'Deleted by business owner';
    try {
      const body = await req.json();
      if (body?.reason) reason = body.reason.trim();
    } catch {
      // Body is optional
    }

    const campaign = await prisma.businessCampaign.findUnique({
      where: { id },
      include: { business: true }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 });
    }

    if (campaign.status === 'DELETED') {
      return NextResponse.json({ error: 'Campaign has already been deleted.' }, { status: 400 });
    }

    const isBusinessOwner = user.businessProfile && user.businessProfile.id === campaign.businessId;
    const isAdmin = user.role === 'ADMIN';

    // Requirement 12: Business owners must not delete another business's campaigns.
    if (!isBusinessOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this campaign and do not have administrative deletion authority.' },
        { status: 403 }
      );
    }

    const effectiveReason = isAdmin && !isBusinessOwner
      ? (reason !== 'Deleted by business owner' ? reason : 'Deleted by Platform Administrator')
      : reason;

    // Requirement 12: Soft deletion
    const deletedCampaign = await prisma.businessCampaign.update({
      where: { id },
      data: {
        status: 'DELETED',
        deletedAt: new Date(),
        deletedById: user.id,
        deletionReason: effectiveReason
      }
    });

    // Requirement 12: Record deletion in audit log
    await prisma.campaignAuditLog.create({
      data: {
        campaignId: id,
        action: 'DELETED',
        performedById: user.id,
        previousStateJson: JSON.stringify({
          status: campaign.status,
          title: campaign.title,
          businessId: campaign.businessId
        }),
        newStateJson: JSON.stringify({
          status: 'DELETED',
          deletedAt: deletedCampaign.deletedAt,
          deletedById: user.id
        }),
        reason: effectiveReason
      }
    });

    return NextResponse.json({
      success: true,
      message: `Campaign "${campaign.title}" has been safely deleted.`,
      campaign: deletedCampaign
    });
  } catch (error: any) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

