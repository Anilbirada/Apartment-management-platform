import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { role } = await req.json();

    const targetEmailMap: Record<string, string> = {
      ADMIN: 'admin@palmheights.com',
      MANAGEMENT: 'manager@palmheights.com',
      RESIDENT: 'rahul.sharma@gmail.com',
      PROVIDER: 'ramesh.plumber@gmail.com',
      BUSINESS: 'owner@namastefresh.com'
    };

    const email = targetEmailMap[role] || 'rahul.sharma@gmail.com';

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        residentProfile: true,
        providerProfile: true,
        businessProfile: true,
        communityMembers: {
          include: { community: true }
        },
        community: true,
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { plan: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User for requested role not found' }, { status: 404 });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role as any,
      communityId: user.communityId || undefined,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
        status: user.status,
        community: user.community,
        residentProfile: user.residentProfile,
        providerProfile: user.providerProfile,
        businessProfile: user.businessProfile,
        communityMembers: user.communityMembers,
        subscriptions: user.subscriptions
      }
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
