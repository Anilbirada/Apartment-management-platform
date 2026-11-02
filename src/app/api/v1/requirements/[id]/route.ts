import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requirement = await prisma.requirement.findUnique({
      where: { id: params.id },
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
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!requirement) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, requirement });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { status, applicationId, action } = await req.json();

    const requirement = await prisma.requirement.findUnique({
      where: { id: params.id }
    });

    if (!requirement) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    if (requirement.residentId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized to modify this requirement' }, { status: 403 });
    }

    // Action on application (SHORTLIST, SELECT, REJECT)
    if (applicationId && action) {
      const updatedApp = await prisma.requirementApplication.update({
        where: { id: applicationId },
        data: {
          status: action === 'SELECT' ? 'SELECTED' : action === 'SHORTLIST' ? 'SHORTLISTED' : 'REJECTED'
        },
        include: { applicant: true }
      });

      if (action === 'SELECT') {
        // Mark requirement as FILLED
        await prisma.requirement.update({
          where: { id: params.id },
          data: { status: 'FILLED' }
        });

        // Notify applicant
        await prisma.notification.create({
          data: {
            userId: updatedApp.applicantId,
            type: 'REQUIREMENT_UPDATE',
            title: '🎉 You have been Selected!',
            message: `Congratulations! The resident has selected you for "${requirement.roleTitle}". Check messages for coordination.`,
            link: `/requirements/${requirement.id}`
          }
        });
      }

      return NextResponse.json({ success: true, application: updatedApp });
    }

    // Update status of requirement
    if (status) {
      const updated = await prisma.requirement.update({
        where: { id: params.id },
        data: { status }
      });
      return NextResponse.json({ success: true, requirement: updated });
    }

    return NextResponse.json({ error: 'No valid action provided' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
