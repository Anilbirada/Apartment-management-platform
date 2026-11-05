import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    const { id } = params;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'MANAGEMENT' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden. Only Society Management and Administrators can make manual visit corrections.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, reason, customExitTime } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: 'A mandatory administrator reason is required for manual visit corrections.' },
        { status: 400 }
      );
    }

    const visit = await prisma.providerVisit.findUnique({
      where: { id },
      include: { community: true, providerProfile: { include: { user: true } } }
    });

    if (!visit) {
      return NextResponse.json({ error: 'Visit record not found.' }, { status: 404 });
    }

    // Apartment isolation check for management
    if (user.role === 'MANAGEMENT' && user.communityId !== visit.communityId) {
      return NextResponse.json(
        { error: 'Forbidden. You can only manage visits for your assigned apartment.' },
        { status: 403 }
      );
    }

    const now = new Date();
    const originalState = {
      visitStatus: visit.visitStatus,
      entryTimestamp: visit.entryTimestamp,
      exitTimestamp: visit.exitTimestamp
    };

    let updatedVisit: any = null;

    if (action === 'FORCE_EXIT' || action === 'MANUAL_EXIT') {
      const exitTime = customExitTime ? new Date(customExitTime) : now;
      const entryTime = visit.entryTimestamp ? new Date(visit.entryTimestamp).getTime() : exitTime.getTime() - 1000 * 60 * 30;
      const duration = Math.max(1, Math.round((exitTime.getTime() - entryTime) / 60000));

      updatedVisit = await prisma.providerVisit.update({
        where: { id },
        data: {
          exitTimestamp: exitTime,
          durationMinutes: duration,
          visitStatus: 'EXITED',
          isManualCorrection: true,
          manualCorrectionReason: reason.trim(),
          correctedById: user.id
        }
      });

      // Audit Log
      await prisma.visitAuditLog.create({
        data: {
          visitId: id,
          action: 'MANUAL_CORRECTION',
          performedById: user.id,
          previousStateJson: JSON.stringify(originalState),
          newStateJson: JSON.stringify({ visitStatus: 'EXITED', exitTimestamp: exitTime, durationMinutes: duration }),
          reason: reason.trim()
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Manual exit correction recorded with administrative audit trail.',
        visit: updatedVisit
      });
    }

    return NextResponse.json({ error: 'Unsupported correction action.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in manual correction:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
