import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { getCurrentUser } from '@/lib/auth';

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
    const isPublicSummary = searchParams.get('publicSummary') === 'true' || searchParams.get('summary') === 'true';

    // REQUIREMENT 11 & MARKETPLACE PRIVACY RULE:
    // Unauthenticated visitors may only retrieve high-level category & count summaries.
    // Full service provider directory requires authentication.
    const currentUser = await getCurrentUser(req);
    if (!currentUser && !isPublicSummary) {
      return NextResponse.json(
        {
          error: 'AUTHENTICATION_REQUIRED',
          message: 'Please log in to explore services and local businesses in your community.'
        },
        { status: 401 }
      );
    }

    if (!currentUser && isPublicSummary) {
      // Return aggregate counts and category metadata only
      const totalProviders = await prisma.providerProfile.count({
        where: { isApproved: true, verificationStatus: 'APPROVED' }
      });
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        include: { _count: { select: { listings: true } } }
      });
      return NextResponse.json({
        success: true,
        summary: true,
        totalProviders,
        categories
      });
    }

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

    // Geographic local area matching
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

    const rawProviders = await prisma.providerProfile.findMany({
      where,
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

    // REQUIREMENT 12: Tier-based backend priority ranking
    // Gold (3) > Silver (2) > Bronze (1)
    const tierWeights: Record<string, number> = {
      GOLD: 3,
      SILVER: 2,
      BRONZE: 1
    };

    const sortedProviders = [...rawProviders].sort((a, b) => {
      const weightA = tierWeights[a.tier?.toUpperCase() || 'BRONZE'] || 1;
      const weightB = tierWeights[b.tier?.toUpperCase() || 'BRONZE'] || 1;

      // 1. Primary Sort: Membership Tier Priority
      if (weightB !== weightA) {
        return weightB - weightA;
      }

      // 2. Secondary Sort: Selected filter or Rating/Jobs
      if (sortBy === 'price_asc') {
        return (a.startingPrice || 0) - (b.startingPrice || 0);
      } else if (sortBy === 'jobs_desc') {
        return (b.completedJobsCount || 0) - (a.completedJobsCount || 0);
      } else {
        // Default: rating desc, then jobs desc
        if ((b.rating || 0) !== (a.rating || 0)) {
          return (b.rating || 0) - (a.rating || 0);
        }
        return (b.completedJobsCount || 0) - (a.completedJobsCount || 0);
      }
    });

    return NextResponse.json({ success: true, count: sortedProviders.length, providers: sortedProviders });
  } catch (error: any) {
    console.error('Error fetching providers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
