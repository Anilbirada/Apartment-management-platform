import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Platform Administrator privileges required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    const where: any = {};
    if (role && role !== 'ALL') {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        isVerified: true,
        avatar: true,
        createdAt: true,
        community: {
          select: { id: true, name: true, city: true }
        },
        providerProfile: {
          select: { id: true, businessName: true, tier: true, isApproved: true }
        },
        businessProfile: {
          select: { id: true, businessName: true, tier: true, isApproved: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Platform Administrator privileges required.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, role, status, isVerified } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    const validRoles = ['GUEST', 'RESIDENT', 'PROVIDER', 'MANAGEMENT', 'BUSINESS', 'ADMIN'];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role provided.' }, { status: 400 });
    }

    const updateData: any = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (typeof isVerified === 'boolean') updateData.isVerified = isVerified;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: `User ${updated.name} updated successfully.`,
      user: {
        id: updated.id,
        name: updated.name,
        role: updated.role,
        status: updated.status,
        isVerified: updated.isVerified
      }
    });
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
