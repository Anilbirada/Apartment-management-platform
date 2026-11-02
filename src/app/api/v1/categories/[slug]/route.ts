import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: params.slug },
      include: {
        subCategories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        },
        listings: {
          where: { status: 'PUBLISHED' },
          include: {
            providerProfile: {
              include: { user: true }
            },
            subCategory: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGEMENT')) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const updated = await prisma.category.update({
      where: { slug: params.slug },
      data: {
        name: body.name,
        description: body.description,
        icon: body.icon,
        group: body.group,
        launchStatus: body.launchStatus,
        isActive: body.isActive !== undefined ? body.isActive : undefined
      },
      include: { subCategories: true }
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
