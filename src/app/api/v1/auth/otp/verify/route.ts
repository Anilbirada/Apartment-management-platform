import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhone, signToken } from '@/lib/auth';
import { verifyStoredOtp } from '@/lib/otpStore';

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Mobile number and OTP are required' }, { status: 400 });
    }

    const normalized = normalizePhone(phone);
    const verification = verifyStoredOtp(normalized, otp);

    if (!verification.success) {
      return NextResponse.json({ error: verification.message }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { phone: normalized },
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Account has been temporarily suspended by society management' },
        { status: 403 }
      );
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role as any,
      communityId: user.communityId || undefined,
      name: user.name
    });

    const response = NextResponse.json({
      success: true,
      message: 'Mobile authentication verified successfully.',
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
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
