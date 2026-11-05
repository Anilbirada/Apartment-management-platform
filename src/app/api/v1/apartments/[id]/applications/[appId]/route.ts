import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; appId: string } }
) {
  try {
    const user = await getCurrentUser(req);
    const { id, appId } = params;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN' && (user.role !== 'MANAGEMENT' || user.communityId !== id)) {
      return NextResponse.json(
        { error: 'Forbidden. You do not have permissions to review applications for this apartment.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { decision, reason } = body; // 'APPROVE' or 'REJECT'

    if (!decision || (decision !== 'APPROVE' && decision !== 'REJECT')) {
      return NextResponse.json({ error: 'Valid decision ("APPROVE" or "REJECT") is required.' }, { status: 400 });
    }

    if (decision === 'REJECT' && !reason?.trim()) {
      return NextResponse.json({ error: 'A mandatory rejection reason is required.' }, { status: 400 });
    }

    const application = await prisma.residentApplication.findUnique({
      where: { id: appId },
      include: { user: true, community: true }
    });

    if (!application || application.communityId !== id) {
      return NextResponse.json({ error: 'Application record not found for this apartment.' }, { status: 404 });
    }

    if (decision === 'APPROVE') {
      // 1. Update application status
      await prisma.residentApplication.update({
        where: { id: appId },
        data: {
          status: 'APPROVED',
          reviewedById: user.id,
          reviewedAt: new Date()
        }
      });

      // 2. Activate user account
      await prisma.user.update({
        where: { id: application.userId },
        data: {
          isVerified: true,
          status: 'ACTIVE',
          communityId: id
        }
      });

      // 3. Create or update community membership
      await prisma.communityMember.upsert({
        where: {
          communityId_block_flatNumber: {
            communityId: id,
            block: application.block,
            flatNumber: application.flatNumber
          }
        },
        create: {
          userId: application.userId,
          communityId: id,
          block: application.block,
          flatNumber: application.flatNumber,
          residentType: application.residentType,
          isVerified: true
        },
        update: {
          userId: application.userId,
          residentType: application.residentType,
          isVerified: true
        }
      });

      // 4. Notify resident
      await prisma.notification.create({
        data: {
          userId: application.userId,
          type: 'SERVICE_REQUEST',
          title: 'Apartment Membership Approved! 🎉',
          message: `Your registration for ${application.community.name} (${application.block}-${application.flatNumber}) has been approved by society management. Full marketplace access granted!`,
          link: '/'
        }
      });

      return NextResponse.json({
        success: true,
        message: `Resident application for ${application.user.name} approved successfully.`
      });
    } else {
      // REJECT decision
      await prisma.residentApplication.update({
        where: { id: appId },
        data: {
          status: 'REJECTED',
          rejectionReason: reason.trim(),
          reviewedById: user.id,
          reviewedAt: new Date()
        }
      });

      await prisma.user.update({
        where: { id: application.userId },
        data: {
          status: 'SUSPENDED'
        }
      });

      await prisma.notification.create({
        data: {
          userId: application.userId,
          type: 'SERVICE_REQUEST',
          title: 'Apartment Registration Not Approved',
          message: `Your membership request for ${application.community.name} was not approved. Reason: ${reason.trim()}`,
          link: '/login'
        }
      });

      return NextResponse.json({
        success: true,
        message: `Resident application for ${application.user.name} declined.`
      });
    }
  } catch (error: any) {
    console.error('Error reviewing application:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
