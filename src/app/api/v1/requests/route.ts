import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let where: any = {};
    if (status) where.status = status;

    if (user.role === 'RESIDENT') {
      where.residentId = user.id;
    } else if (user.role === 'PROVIDER' && user.providerProfile) {
      where.providerProfileId = user.providerProfile.id;
    } else if (user.role === 'ADMIN' || user.role === 'MANAGEMENT') {
      // Admin sees community requests
    }

    const requests = await prisma.serviceRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        resident: {
          select: {
            id: true,
            name: true,
            avatar: true,
            communityMembers: true,
            // Phone is never exposed to providers
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

    return NextResponse.json({ success: true, count: requests.length, requests });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const {
      providerProfileId,
      serviceListingId,
      categoryName,
      subCategoryName,
      preferredDate,
      preferredTimeSlot,
      block,
      flatNumber,
      problemDescription,
      photosJson,
      additionalMessage
    } = body;

    if (!providerProfileId || !categoryName || !preferredDate || !preferredTimeSlot || !block || !flatNumber || !problemDescription) {
      return NextResponse.json({ error: 'All essential booking fields are required' }, { status: 400 });
    }

    // Generate unique request ID
    const count = await prisma.serviceRequest.count();
    const requestNumber = `REQ-2026-${String(count + 1).padStart(4, '0')}`;

    const request = await prisma.serviceRequest.create({
      data: {
        requestNumber,
        residentId: user.id,
        providerProfileId,
        serviceListingId: serviceListingId || null,
        categoryName,
        subCategoryName: subCategoryName || null,
        preferredDate,
        preferredTimeSlot,
        block,
        flatNumber,
        problemDescription,
        photosJson: photosJson ? JSON.stringify(photosJson) : null,
        additionalMessage: additionalMessage || null,
        status: 'REQUESTED'
      },
      include: {
        providerProfile: {
          include: { user: true }
        }
      }
    });

    // Record initial status in history
    await prisma.requestStatusHistory.create({
      data: {
        serviceRequestId: request.id,
        fromStatus: null,
        toStatus: 'REQUESTED',
        note: `Request submitted by resident ${user.name} for ${block} - ${flatNumber}`,
        changedById: user.id
      }
    });

    // Notify provider
    if (request.providerProfile?.user) {
      await prisma.notification.create({
        data: {
          userId: request.providerProfile.user.id,
          type: 'SERVICE_REQUEST',
          title: `New Service Request ${requestNumber}`,
          message: `${user.name} requested ${categoryName} (${subCategoryName || ''}) for ${preferredDate} at ${preferredTimeSlot}.`,
          link: '/provider/dashboard'
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Service request created successfully',
      requestNumber,
      request
    });
  } catch (error: any) {
    console.error('Error creating service request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
