import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken, normalizeEmail, normalizePhone } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, phone, identifier, password } = body;

    const inputIdentifier = identifier || email || phone;

    if (!inputIdentifier || !password) {
      return NextResponse.json(
        { error: 'Email or mobile number, and password are required' },
        { status: 400 }
      );
    }

    let user: any = null;

    // Check if identifier is email or phone
    if (inputIdentifier.includes('@')) {
      const normalized = normalizeEmail(inputIdentifier);
      user = await prisma.user.findUnique({
        where: { email: normalized },
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
    } else {
      const normalizedPhone = normalizePhone(inputIdentifier);
      user = await prisma.user.findUnique({
        where: { phone: normalizedPhone },
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
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials. No user found with this email or mobile number.' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid password. Please check your credentials.' },
        { status: 401 }
      );
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Account has been temporarily suspended by administration.' },
        { status: 403 }
      );
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
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
