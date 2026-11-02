import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { coverNote, expectedPay, experience, applicantRole } = await req.json();

    if (!coverNote || !expectedPay) {
      return NextResponse.json({ error: 'Cover note and expected pay are required' }, { status: 400 });
    }

    const requirement = await prisma.requirement.findUnique({
      where: { id: params.id }
    });

    if (!requirement) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    if (requirement.status !== 'OPEN') {
      return NextResponse.json({ error: 'This requirement is no longer accepting applications' }, { status: 400 });
    }

    // Check if already applied
    const existing = await prisma.requirementApplication.findFirst({
      where: {
        requirementId: params.id,
        applicantId: user.id
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'You have already applied for this requirement' }, { status: 400 });
    }

    const application = await prisma.requirementApplication.create({
      data: {
        requirementId: params.id,
        applicantId: user.id,
        applicantRole: applicantRole || user.role,
        coverNote,
        expectedPay: parseFloat(expectedPay),
        experience: experience || 'Experienced in residential campus',
        status: 'PENDING'
      },
      include: {
        applicant: {
          select: { id: true, name: true, avatar: true, isVerified: true }
        }
      }
    });

    // Increment applicant count on requirement
    await prisma.requirement.update({
      where: { id: params.id },
      data: { applicantCount: { increment: 1 } }
    });

    // Notify resident
    await prisma.notification.create({
      data: {
        userId: requirement.residentId,
        type: 'REQUIREMENT_UPDATE',
        title: 'New Applicant for Your Requirement',
        message: `${user.name} applied for "${requirement.roleTitle}". Tap to review their application.`,
        link: `/requirements/${params.id}`
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully to resident',
      application
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
