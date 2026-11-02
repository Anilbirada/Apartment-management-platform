import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { serviceRequestId, rating, comment, photoUrl } = body;

    if (!serviceRequestId || !rating || !comment) {
      return NextResponse.json({ error: 'Service request ID, rating, and comment are required' }, { status: 400 });
    }

    // 1. Verify that the request exists and belongs to this resident
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
      include: {
        providerProfile: { include: { user: true } },
        review: true
      }
    });

    if (!serviceRequest) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 });
    }

    if (serviceRequest.residentId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized: You can only review your own service requests' }, { status: 403 });
    }

    // 2. Strict Rule: Reviews come from completed jobs only!
    if (serviceRequest.status !== 'COMPLETED' && serviceRequest.status !== 'REVIEWED') {
      return NextResponse.json({
        error: 'Reviews come from completed jobs only. This service has not been marked as completed.'
      }, { status: 400 });
    }

    if (serviceRequest.review) {
      return NextResponse.json({ error: 'You have already reviewed this service request' }, { status: 400 });
    }

    // 3. Privacy Rule: Only first name and block are preserved for public review display
    const firstName = user.name.split(' ')[0] || user.name;
    const reviewerBlock = serviceRequest.block || 'Tower Resident';

    const review = await prisma.review.create({
      data: {
        serviceRequestId,
        residentId: user.id,
        providerProfileId: serviceRequest.providerProfileId,
        rating: parseInt(rating, 10),
        comment,
        photoUrl: photoUrl || null,
        reviewerFirstName: firstName,
        reviewerBlock: reviewerBlock
      }
    });

    // 4. Update request status to REVIEWED
    await prisma.serviceRequest.update({
      where: { id: serviceRequestId },
      data: { status: 'REVIEWED' }
    });

    await prisma.requestStatusHistory.create({
      data: {
        serviceRequestId,
        fromStatus: serviceRequest.status,
        toStatus: 'REVIEWED',
        note: `Resident ${firstName} (${reviewerBlock}) submitted a ${rating}-star review`,
        changedById: user.id
      }
    });

    // 5. Recalculate provider overall rating
    const allReviews = await prisma.review.findMany({
      where: { providerProfileId: serviceRequest.providerProfileId }
    });

    const totalScore = allReviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = totalScore / allReviews.length;

    await prisma.providerProfile.update({
      where: { id: serviceRequest.providerProfileId },
      data: {
        rating: Math.round(averageRating * 10) / 10,
        reviewCount: allReviews.length
      }
    });

    // 6. Notify provider
    await prisma.notification.create({
      data: {
        userId: serviceRequest.providerProfile.user.id,
        type: 'REVIEW_RECEIVED',
        title: `New ${rating}-Star Review Received!`,
        message: `${firstName} from ${reviewerBlock} posted a review for ${serviceRequest.requestNumber}.`,
        link: '/provider/dashboard'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully. Reviews come from completed jobs only.',
      review
    });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
