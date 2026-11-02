import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status') || 'PUBLISHED';

    const where: any = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;

    if (query) {
      where.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
        { category: { name: { contains: query } } },
        { subCategory: { name: { contains: query } } },
        { providerProfile: { businessName: { contains: query } } }
      ];
    }

    const listings = await prisma.serviceListing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        subCategory: true,
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
        }
      }
    });

    return NextResponse.json({ success: true, count: listings.length, listings });
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

    if (!user.providerProfile) {
      return NextResponse.json({ error: 'Only registered service providers can post services' }, { status: 403 });
    }

    const body = await req.json();
    const {
      categoryId,
      subCategoryId,
      title,
      description,
      priceType = 'STARTING_PRICE',
      price,
      photosJson
    } = body;

    if (!categoryId || !title || !price) {
      return NextResponse.json({ error: 'Category, title, and price are required' }, { status: 400 });
    }

    // New listings are submitted as PENDING_APPROVAL and default to APARTMENT_ONLY
    const listing = await prisma.serviceListing.create({
      data: {
        providerProfileId: user.providerProfile.id,
        categoryId,
        subCategoryId: subCategoryId || null,
        title,
        description: description || '',
        priceType,
        price: parseFloat(price),
        visibility: 'APARTMENT_ONLY', // Default on Day 1
        status: 'PENDING_APPROVAL', // Strict rule: Pending approval, not published immediately
        photosJson: photosJson ? JSON.stringify(photosJson) : null
      },
      include: {
        category: true,
        subCategory: true
      }
    });

    // Notify admins about pending listing
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'LISTING_APPROVAL',
          title: 'New Service Listing Pending Approval',
          message: `${user.name} submitted "${title}" for approval.`,
          link: '/admin/approvals'
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Service submitted for admin review and approval.',
      listing
    });
  } catch (error: any) {
    console.error('Error creating service listing:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
