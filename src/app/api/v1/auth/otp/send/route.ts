import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhone } from '@/lib/auth';
import { storeOtp } from '@/lib/otpStore';

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });
    }

    const normalized = normalizePhone(phone);

    // Verify if user exists for this phone number
    const user = await prisma.user.findUnique({
      where: { phone: normalized }
    });

    if (!user) {
      return NextResponse.json(
        { error: `No registered account found for ${normalized}. Please register first.` },
        { status: 404 }
      );
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    storeOtp(normalized, otp);

    console.log(`[SMS Gateway Simulator] OTP for ${normalized}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to ${normalized}.`,
      // Provide devOtp for seamless demo and testing without physical SMS gateway credentials
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
