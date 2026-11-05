import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, roleGuard } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');

    const where: any = {};
    if (city) {
      where.city = { contains: city };
    }

    const apartments = await prisma.community.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        blocks: {
          include: {
            units: true
          }
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        gates: true,
        _count: {
          select: {
            users: true,
            members: true,
            residentApplications: { where: { status: 'PENDING' } }
          }
        }
      }
    });

    return NextResponse.json({ success: true, count: apartments.length, apartments });
  } catch (error: any) {
    console.error('Error fetching apartments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Only Platform Administrators can create new apartments.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      code,
      address,
      city,
      state,
      postalCode,
      totalBlocks = 2,
      totalFlats = 100,
      heroImage,
      onboardingMode = 'BOTH',
      contactPerson,
      contactPhone,
      contactEmail,
      blocks
    } = body;

    if (!name || !code || !address || !city || !postalCode) {
      return NextResponse.json(
        { error: 'Name, unique code, address, city, and postal code are required.' },
        { status: 400 }
      );
    }

    // Check duplicate code
    const existing = await prisma.community.findUnique({
      where: { code: code.trim().toUpperCase() }
    });

    if (existing) {
      return NextResponse.json(
        { error: `An apartment with society code "${code}" already exists.` },
        { status: 400 }
      );
    }

    const apartment = await prisma.community.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        address: address.trim(),
        city: city.trim(),
        state: state?.trim() || 'Karnataka',
        postalCode: postalCode.trim(),
        totalBlocks: parseInt(totalBlocks, 10) || 2,
        totalFlats: parseInt(totalFlats, 10) || 100,
        heroImage: heroImage || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80',
        status: 'ACTIVE',
        onboardingMode,
        contactPerson,
        contactPhone,
        contactEmail
      }
    });

    // Create initial blocks if provided or default
    const blockList = blocks || ['Block A', 'Block B'];
    for (const bName of blockList) {
      const blk = await prisma.apartmentBlock.create({
        data: {
          communityId: apartment.id,
          name: typeof bName === 'string' ? bName : bName.name,
          totalFloors: 10
        }
      });

      // Create default gates for QR Attendance
      await prisma.apartmentGate.create({
        data: {
          communityId: apartment.id,
          gateName: `${apartment.name} Main Gate`,
          gateCode: `GATE-${apartment.code}-01`,
          qrSecret: `secret_${apartment.code.toLowerCase()}_gate_2026`,
          isActive: true
        }
      });

      // Create sample units
      const sampleFlats = ['101', '102', '201', '202'];
      for (const flat of sampleFlats) {
        await prisma.apartmentUnit.create({
          data: {
            blockId: blk.id,
            floorNumber: parseInt(flat[0], 10),
            unitNumber: flat,
            residentType: 'VACANT',
            status: 'VACANT'
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Apartment community created successfully.',
      apartment
    });
  } catch (error: any) {
    console.error('Error creating apartment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
