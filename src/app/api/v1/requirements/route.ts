import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const scheduleType = searchParams.get('scheduleType');
    const status = searchParams.get('status') || 'OPEN';
    const myRequirements = searchParams.get('mine') === 'true';

    const user = await getCurrentUser(req);

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (category) where.category = category;
    if (scheduleType) where.scheduleType = scheduleType;

    if (myRequirements && user) {
      where.residentId = user.id;
    }

    const requirements = await prisma.requirement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        resident: {
          select: {
            id: true,
            name: true,
            avatar: true,
            communityMembers: {
              select: { block: true, flatNumber: true }
            }
          }
        },
        applications: {
          include: {
            applicant: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
                isVerified: true
              }
            }
          }
        },
        _count: {
          select: { applications: true }
        }
      }
    });

    return NextResponse.json({ success: true, count: requirements.length, requirements });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const {
      category,
      roleTitle,
      scheduleType = 'FULL_TIME',
      duration = 'LONG_TERM',
      payRangeMin,
      payRangeMax,
      payPeriod = 'MONTHLY',
      description,
      preferredStartTime
    } = body;

    if (!category || !roleTitle || !description || !payRangeMin || !payRangeMax) {
      return NextResponse.json({ error: 'All essential requirement fields are required' }, { status: 400 });
    }

    const community = await prisma.community.findFirst();
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 500 });
    }

    const count = await prisma.requirement.count();
    const requirementNumber = `REQMT-2026-${String(count + 1).padStart(4, '0')}`;

    const requirement = await prisma.requirement.create({
      data: {
        requirementNumber,
        residentId: user.id,
        communityId: community.id,
        category,
        roleTitle,
        scheduleType,
        duration,
        payRangeMin: parseFloat(payRangeMin),
        payRangeMax: parseFloat(payRangeMax),
        payPeriod,
        description,
        preferredStartTime: preferredStartTime || null,
        status: 'OPEN',
        applicantCount: 0
      },
      include: {
        resident: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    // Notify community providers and relevant staff
    const providers = await prisma.user.findMany({
      where: { role: 'PROVIDER' },
      take: 5
    });

    for (const prov of providers) {
      await prisma.notification.create({
        data: {
          userId: prov.id,
          type: 'REQUIREMENT_UPDATE',
          title: `New Resident Requirement: ${roleTitle}`,
          message: `Resident in ${user.name} is looking to hire a ${category}. Tap to view details and apply.`,
          link: `/requirements/${requirement.id}`
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Requirement posted successfully. Relevant applicants and community members can now apply.',
      requirement
    });
  } catch (error: any) {
    console.error('Error posting requirement:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
