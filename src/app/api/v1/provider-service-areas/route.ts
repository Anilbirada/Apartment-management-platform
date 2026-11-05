import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || !user.providerProfile) {
      return NextResponse.json({ error: 'Unauthorized. Provider profile required.' }, { status: 403 });
    }

    const areas = await prisma.providerServiceArea.findMany({
      where: { providerProfileId: user.providerProfile.id },
      include: { community: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, count: areas.length, areas });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || !user.providerProfile) {
      return NextResponse.json({ error: 'Unauthorized. Provider profile required.' }, { status: 403 });
    }

    const body = await req.json();
    const { country = 'India', state = 'Karnataka', city = 'Bengaluru', locality, postalCode, serviceRadiusKm = 5.0, communityId } = body;

    if (!locality || !postalCode) {
      return NextResponse.json({ error: 'Locality and PIN code are required.' }, { status: 400 });
    }

    const serviceArea = await prisma.providerServiceArea.create({
      data: {
        providerProfileId: user.providerProfile.id,
        country,
        state,
        city,
        locality: locality.trim(),
        postalCode: postalCode.trim(),
        serviceRadiusKm: parseFloat(serviceRadiusKm) || 5.0,
        communityId: communityId || null
      },
      include: { community: true }
    });

    return NextResponse.json({
      success: true,
      message: `Service coverage added for ${locality} (${postalCode}).`,
      serviceArea
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || !user.providerProfile) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Service area ID is required.' }, { status: 400 });
    }

    const area = await prisma.providerServiceArea.findUnique({ where: { id } });
    if (!area || area.providerProfileId !== user.providerProfile.id) {
      return NextResponse.json({ error: 'Service area record not found.' }, { status: 404 });
    }

    await prisma.providerServiceArea.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Service area removed successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
