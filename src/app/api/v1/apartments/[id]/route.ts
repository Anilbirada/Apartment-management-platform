import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const apartment = await prisma.community.findUnique({
      where: { id },
      include: {
        blocks: {
          include: {
            units: true
          }
        },
        gates: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        _count: {
          select: {
            users: true,
            members: true,
            residentApplications: true,
            providerVisits: true
          }
        }
      }
    });

    if (!apartment) {
      return NextResponse.json({ error: 'Apartment community not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, apartment });
  } catch (error: any) {
    console.error('Error fetching apartment details:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    const { id } = params;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Authorization: Admin can update any apartment; Management can only update their assigned apartment
    if (user.role !== 'ADMIN' && (user.role !== 'MANAGEMENT' || user.communityId !== id)) {
      return NextResponse.json(
        { error: 'Forbidden. You do not have permissions to modify this apartment community.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      address,
      city,
      state,
      postalCode,
      heroImage,
      onboardingMode,
      contactPerson,
      contactPhone,
      contactEmail,
      managerId,
      status
    } = body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (postalCode) updateData.postalCode = postalCode;
    if (heroImage) updateData.heroImage = heroImage;
    if (onboardingMode) updateData.onboardingMode = onboardingMode;
    if (contactPerson) updateData.contactPerson = contactPerson;
    if (contactPhone) updateData.contactPhone = contactPhone;
    if (contactEmail) updateData.contactEmail = contactEmail;
    if (status && user.role === 'ADMIN') updateData.status = status;
    if (managerId && user.role === 'ADMIN') updateData.managerId = managerId;

    const updated = await prisma.community.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Apartment settings updated successfully.',
      apartment: updated
    });
  } catch (error: any) {
    console.error('Error updating apartment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
