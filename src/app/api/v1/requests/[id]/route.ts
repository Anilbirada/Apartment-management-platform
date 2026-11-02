import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const VALID_TRANSITIONS: Record<string, string[]> = {
  REQUESTED: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['VISIT_SCHEDULED', 'CANCELLED'],
  VISIT_SCHEDULED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: ['REVIEWED'],
  REJECTED: [],
  CANCELLED: [],
  EXPIRED: [],
  REVIEWED: []
};

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const request = await prisma.serviceRequest.findUnique({
      where: { id: params.id },
      include: {
        resident: {
          select: {
            id: true,
            name: true,
            avatar: true,
            // Phone is intentionally omitted to protect resident privacy
          }
        },
        providerProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                isVerified: true
              }
            }
          }
        },
        serviceListing: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' }
        },
        review: true
      }
    });

    if (!request) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, request });
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
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { status: targetStatus, reason, completionPhoto, completionNotes } = await req.json();

    const existing = await prisma.serviceRequest.findUnique({
      where: { id: params.id },
      include: {
        providerProfile: { include: { user: true } },
        resident: true
      }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Role check: Only provider, resident, or admin can update
    const isResident = existing.residentId === user.id;
    const isProvider = existing.providerProfile.user.id === user.id;
    const isAdmin = user.role === 'ADMIN' || user.role === 'MANAGEMENT';

    if (!isResident && !isProvider && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized to change this request' }, { status: 403 });
    }

    // Mandatory reason check for rejection or cancellation
    if ((targetStatus === 'REJECTED' || targetStatus === 'CANCELLED') && !reason) {
      return NextResponse.json(
        { error: 'A mandatory reason is required when rejecting or cancelling a request' },
        { status: 400 }
      );
    }

    // Backend status transition validation
    const allowed = VALID_TRANSITIONS[existing.status] || [];
    if (!allowed.includes(targetStatus) && !isAdmin) {
      return NextResponse.json(
        { error: `Invalid transition from ${existing.status} to ${targetStatus}` },
        { status: 400 }
      );
    }

    const updated = await prisma.serviceRequest.update({
      where: { id: params.id },
      data: {
        status: targetStatus,
        cancellationReason: reason || existing.cancellationReason,
        completionPhoto: completionPhoto || existing.completionPhoto,
        completionNotes: completionNotes || existing.completionNotes,
      }
    });

    // Record audit trail
    await prisma.requestStatusHistory.create({
      data: {
        serviceRequestId: params.id,
        fromStatus: existing.status,
        toStatus: targetStatus,
        note: reason || completionNotes || `Status updated to ${targetStatus} by ${user.name}`,
        changedById: user.id
      }
    });

    // Update completed jobs count on completion
    if (targetStatus === 'COMPLETED' && existing.status !== 'COMPLETED') {
      await prisma.providerProfile.update({
        where: { id: existing.providerProfileId },
        data: {
          completedJobsCount: { increment: 1 }
        }
      });
    }

    // Send notification to the opposite party
    const recipientId = isProvider ? existing.residentId : existing.providerProfile.user.id;
    const titleMap: Record<string, string> = {
      ACCEPTED: 'Service Request Accepted!',
      VISIT_SCHEDULED: 'Technician Visit Scheduled',
      IN_PROGRESS: 'Work Started at Your Apartment',
      COMPLETED: 'Job Completed - Please Rate & Review',
      REJECTED: 'Service Request Declined',
      CANCELLED: 'Service Request Cancelled',
    };

    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'REQUEST_STATUS_CHANGE',
        title: titleMap[targetStatus] || `Request ${targetStatus}`,
        message: `Request ${existing.requestNumber} status changed to ${targetStatus}. ${reason ? 'Reason: ' + reason : ''}`,
        link: isProvider ? '/requests' : '/provider/dashboard'
      }
    });

    return NextResponse.json({ success: true, request: updated });
  } catch (error: any) {
    console.error('Error updating service request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
