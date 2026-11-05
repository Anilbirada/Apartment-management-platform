import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateGateQrToken } from '@/lib/qrCrypto';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const communityId = searchParams.get('communityId');
    const gateCode = searchParams.get('gateCode');

    let gate = null;
    if (gateCode) {
      gate = await prisma.apartmentGate.findUnique({
        where: { gateCode },
        include: { community: true }
      });
    } else if (communityId) {
      gate = await prisma.apartmentGate.findFirst({
        where: { communityId, isActive: true },
        include: { community: true }
      });
    } else {
      gate = await prisma.apartmentGate.findFirst({
        where: { isActive: true },
        include: { community: true }
      });
    }

    if (!gate) {
      return NextResponse.json({ error: 'No active gate found for this apartment community.' }, { status: 404 });
    }

    const qrToken = generateGateQrToken(gate.id, gate.gateCode, gate.communityId, gate.qrSecret);

    return NextResponse.json({
      success: true,
      gate: {
        id: gate.id,
        gateName: gate.gateName,
        gateCode: gate.gateCode,
        communityName: gate.community.name,
        communityId: gate.communityId
      },
      qrToken,
      expiresInSeconds: 1800,
      timestamp: new Date()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
