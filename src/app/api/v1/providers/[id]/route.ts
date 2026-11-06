import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return NextResponse.json(
        {
          error: 'AUTHENTICATION_REQUIRED',
          message: 'Please log in to explore services and local businesses in your community.'
        },
        { status: 401 }
      );
    }
    const provider = await prisma.providerProfile.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            isVerified: true,
            createdAt: true,
            // Phone is intentionally omitted to maintain resident-provider privacy
          }
        },
        listings: {
          where: { status: 'PUBLISHED' },
          include: {
            category: true,
            subCategory: true
          }
        },
        availabilities: {
          orderBy: { dayOfWeek: 'asc' }
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            rating: true,
            comment: true,
            photoUrl: true,
            reviewerFirstName: true,
            reviewerBlock: true,
            createdAt: true
          }
        }
      }
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // Compute 5-star to 1-star breakdown
    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    provider.reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      ratingBreakdown[star] = (ratingBreakdown[star] || 0) + 1;
    });

    let beforeAfterList = [];
    if (provider.beforeAfterPhotos) {
      try {
        beforeAfterList = JSON.parse(provider.beforeAfterPhotos);
      } catch (e) {
        beforeAfterList = [];
      }
    }

    return NextResponse.json({
      success: true,
      provider: {
        ...provider,
        beforeAfterList,
        ratingBreakdown,
        totalReviewsCount: provider.reviews.length,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
