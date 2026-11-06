import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'AUTHENTICATION_REQUIRED', message: 'You must be logged in to apply for a role upgrade.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { targetRole, formData, documents } = body;

    if (!targetRole || !['PROVIDER', 'BUSINESS', 'MANAGEMENT'].includes(targetRole)) {
      return NextResponse.json(
        { error: 'Invalid target role. Must be PROVIDER, BUSINESS, or MANAGEMENT.' },
        { status: 400 }
      );
    }

    // Role-specific validation
    if (targetRole === 'PROVIDER') {
      if (!formData?.businessName || !formData?.serviceCategory || !formData?.startingPrice) {
        return NextResponse.json(
          { error: 'Business name, service category, and starting price are required for provider upgrade.' },
          { status: 400 }
        );
      }
    } else if (targetRole === 'BUSINESS') {
      if (!formData?.businessName || !formData?.category || !formData?.address || !formData?.contactPhone) {
        return NextResponse.json(
          { error: 'Business name, category, address, and contact phone are required for business upgrade.' },
          { status: 400 }
        );
      }
    } else if (targetRole === 'MANAGEMENT') {
      if (!formData?.targetCommunityId || !formData?.designation) {
        return NextResponse.json(
          { error: 'Target apartment community and management designation are required.' },
          { status: 400 }
        );
      }
    }

    // Check if user already has an active pending application for this role
    const existingPending = await prisma.roleUpgradeApplication.findFirst({
      where: {
        userId: user.id,
        targetRole,
        status: { in: ['PENDING_REVIEW', 'UNDER_VERIFICATION'] }
      }
    });

    if (existingPending) {
      return NextResponse.json(
        { error: `You already have an upgrade application for ${targetRole} currently pending review.` },
        { status: 400 }
      );
    }

    // Create the upgrade application
    const application = await prisma.roleUpgradeApplication.create({
      data: {
        userId: user.id,
        targetRole,
        status: 'PENDING_REVIEW',
        applicationDataJson: JSON.stringify(formData || {}),
        documentsJson: documents ? JSON.stringify(documents) : null,
        assignedCommunityId: formData?.targetCommunityId || null
      }
    });

    // Notify Platform Admins about the new application
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'PROVIDER_APPROVAL',
          title: `New ${targetRole} Role Upgrade Application`,
          message: `${user.name} submitted an application to become ${targetRole}.`,
          link: '/admin/upgrades'
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Your ${targetRole} membership application has been submitted successfully and is pending administrative review.`,
      application
    });
  } catch (error: any) {
    console.error('Error submitting upgrade application:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
