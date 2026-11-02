import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const group = searchParams.get('group');
    const launchStatus = searchParams.get('launchStatus');

    const where: any = { isActive: true };
    if (group) where.group = group;
    if (launchStatus) where.launchStatus = launchStatus;

    const categories = await prisma.category.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        subCategories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: { listings: true }
        }
      }
    });

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGEMENT')) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { name, slug, description, icon, group, launchStatus, sortOrder, subcategories } = body;

    if (!name || !slug || !group) {
      return NextResponse.json({ error: 'Name, slug, and group are required' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: slug.toLowerCase().replace(/\s+/g, '-'),
        description: description || '',
        icon: icon || 'Briefcase',
        group,
        launchStatus: launchStatus || 'LAUNCHED',
        sortOrder: sortOrder || 0,
        isActive: true,
        subCategories: subcategories ? {
          create: subcategories.map((sub: any, idx: number) => ({
            name: sub.name,
            slug: sub.slug || sub.name.toLowerCase().replace(/\s+/g, '-'),
            description: sub.description || '',
            icon: sub.icon || 'CircleDot',
            sortOrder: idx + 1,
            isActive: true
          }))
        } : undefined
      },
      include: { subCategories: true }
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
