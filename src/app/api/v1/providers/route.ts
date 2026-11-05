import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const subCategorySlug = searchParams.get('subcategory');
    const communityId = searchParams.get('communityId');
    const postalCode = searchParams.get('postalCode');
    const locality = searchParams.get('locality');
    const minRating = searchParams.get('minRating');
    const maxPrice = searchParams.get('maxPrice');
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
    const availableToday = searchParams.get('availableToday') === 'true';
    const sortBy = searchParams.get('sortBy') || 'rating'; // rating, price_asc, jobs_desc

    const where: any = {
      isApproved: true,
      verificationStatus: 'APPROVED'
    };

    if (verifiedOnly) {
      where.user = { isVerified: true };
    }

    if (availableToday) {
      where.availableToday = true;
    }

    if (minRating) {
      where.rating = { gte: parseFloat(minRating) };
    }

    if (maxPrice) {
      where.startingPrice = { lte: parseFloat(maxPrice) };
    }

    // Category / subcategory matching
    if (categorySlug || subCategorySlug) {
      where.listings = {
        some: {
          status: 'PUBLISHED',
          ...(categorySlug ? { category: { slug: categorySlug } } : {}),
          ...(subCategorySlug ? { subCategory: { slug: subCategorySlug } } : {})
        }
      };
    }

    // Geographic local area matching (Requirement 1 & 4)
    if (communityId || postalCode || locality) {
      const areaConditions: any[] = [];
      if (communityId) {
        areaConditions.push({ communityId });
      }
      if (postalCode) {
        areaConditions.push({ postalCode });
      }
      if (locality) {
        areaConditions.push({ locality: { contains: locality } });
      }

      if (areaConditions.length > 0) {
        where.serviceAreas = {
          some: {
            OR: areaConditions
          }
        };
      }
    }

    let orderBy: any = { rating: 'desc' };
    if (sortBy === 'price_asc') {
      orderBy = { startingPrice: 'asc' };
    } else if (sortBy === 'jobs_desc') {
      orderBy = { completedJobsCount: 'desc' };
    } else if (sortBy === 'rating') {
      orderBy = { rating: 'desc' };
    }

    const providers = await prisma.providerProfile.findMany({
      where,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            isVerified: true,
            // PRIVACY RULE: phone is strictly excluded from output payloads!
          }
        },
        serviceAreas: {
          include: { community: true }
        },
        listings: {
          where: { status: 'PUBLISHED' },
          include: {
            category: true,
            subCategory: true
          }
        },
        reviews: {
          take: 3,
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

    return NextResponse.json({ success: true, count: providers.length, providers });
  } catch (error: any) {
    console.error('Error fetching providers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
