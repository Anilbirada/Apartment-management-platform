import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, verifyToken, getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { role } = await req.json();

    // Check current auth and token
    const currentUser = await getCurrentUser(req);
    const rawToken = req.cookies.get('token')?.value || (req.headers.get('authorization')?.startsWith('Bearer ') ? req.headers.get('authorization')!.substring(7) : '');
    const tokenPayload = rawToken ? verifyToken(rawToken) : null;

    // Allow switching if user is Admin, token originated from Admin, or switching back to ADMIN
    const isAuthorized = currentUser?.role === 'ADMIN' || tokenPayload?.originalRole === 'ADMIN' || role === 'ADMIN';

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden: Only Platform Administrators are authorized to switch or simulate user roles.' },
        { status: 403 }
      );
    }

    const targetEmailMap: Record<string, string> = {
      ADMIN: 'admin@palmheights.com',
      MANAGEMENT: 'manager@palmheights.com',
      RESIDENT: 'rahul.sharma@gmail.com',
      PROVIDER: 'ramesh.plumber@gmail.com',
      BUSINESS: 'owner@namastefresh.com',
      GUEST: 'guest.demo@palmheights.com'
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
      originalRole: 'ADMIN'
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
