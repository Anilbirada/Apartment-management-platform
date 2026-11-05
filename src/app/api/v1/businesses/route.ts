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
      orderBy: { createdAt: 'desc' },
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
