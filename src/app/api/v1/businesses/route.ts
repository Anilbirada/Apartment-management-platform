import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const communityId = searchParams.get('communityId');
    const city = searchParams.get('city');
    const isSummary = searchParams.get('summary') === 'true' || searchParams.get('publicSummary') === 'true';

    // REQUIREMENT 11 & MARKETPLACE PRIVACY RULE:
    // Unauthenticated visitors may only retrieve high-level category & count summaries.
    // Full business listings require authentication.
    const currentUser = await getCurrentUser(req);
    if (!currentUser && !isSummary) {
      return NextResponse.json(
        {
          error: 'AUTHENTICATION_REQUIRED',
          message: 'Please log in to explore services and local businesses in your community.'
        },
        { status: 401 }
      );
    }

    if (!currentUser && isSummary) {
      const totalCount = await prisma.localBusiness.count({
        where: { isApproved: true, status: 'ACTIVE' }
      });
      return NextResponse.json({
        success: true,
        summary: true,
        totalBusinesses: totalCount,
        categories: ['GROCERY', 'PHARMACY', 'HARDWARE', 'RESTAURANT', 'SALON']
      });
    }

    const where: any = {
      isApproved: true,
      status: 'ACTIVE'
    };

    if (category) {
      where.category = category;
    }

    if (city) {
      where.city = { contains: city };
    }

    const businesses = await prisma.localBusiness.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        campaigns: {
          where: { status: 'ACTIVE' }
        }
      }
    });

    // If communityId specified, filter businesses that target this apartment
    let filtered = businesses;
    if (communityId) {
      filtered = businesses.filter((b) => {
        if (!b.targetApartments) return true;
        try {
          const ids = JSON.parse(b.targetApartments);
          return Array.isArray(ids) && (ids.length === 0 || ids.includes(communityId));
        } catch {
          return true;
        }
      });
    }

    // REQUIREMENT 12: Tier-based backend priority ranking
    // Gold (3) > Silver (2) > Bronze (1)
    const tierWeights: Record<string, number> = {
      GOLD: 3,
      SILVER: 2,
      BRONZE: 1
    };

    filtered.sort((a, b) => {
      const weightA = tierWeights[a.tier?.toUpperCase() || 'BRONZE'] || 1;
      const weightB = tierWeights[b.tier?.toUpperCase() || 'BRONZE'] || 1;
      if (weightB !== weightA) {
        return weightB - weightA;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({ success: true, count: filtered.length, businesses: filtered });
  } catch (error: any) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      businessName,
      registrationNumber,
      category = 'GROCERY',
      description,
      logoUrl,
      bannerUrl,
      address,
      city = 'Bengaluru',
      state = 'Karnataka',
      postalCode,
      contactPhone,
      contactEmail,
      website,
      operatingAreas = [],
      targetApartments = []
    } = body;

    if (!businessName || !description || !address || !contactPhone) {
      return NextResponse.json(
        { error: 'Business name, description, address, and contact phone are required.' },
        { status: 400 }
      );
    }

    const business = await prisma.localBusiness.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        businessName: businessName.trim(),
        registrationNumber: registrationNumber?.trim() || null,
        category,
        description: description.trim(),
        logoUrl,
        bannerUrl,
        address: address.trim(),
        city,
        state,
        postalCode: postalCode || '560103',
        contactPhone,
        contactEmail: contactEmail || user.email,
        website,
        operatingAreasJson: JSON.stringify(operatingAreas),
        targetApartments: JSON.stringify(targetApartments),
        isApproved: false,
        verificationStatus: 'PENDING',
        status: 'ACTIVE'
      },
      update: {
        businessName: businessName.trim(),
        registrationNumber: registrationNumber?.trim() || null,
        category,
        description: description.trim(),
        logoUrl,
        bannerUrl,
        address: address.trim(),
        city,
        state,
        postalCode: postalCode || '560103',
        contactPhone,
        contactEmail: contactEmail || user.email,
        website,
        operatingAreasJson: JSON.stringify(operatingAreas),
        targetApartments: JSON.stringify(targetApartments)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Business profile saved successfully. Awaiting administration review.',
      business
    });
  } catch (error: any) {
    console.error('Error creating business profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
