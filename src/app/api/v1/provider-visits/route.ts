import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const communityId = searchParams.get('communityId');
    const todayOnly = searchParams.get('today') === 'true';
    const status = searchParams.get('status'); // e.g. 'INSIDE_APARTMENT'

    const where: any = {};

    // Apartment isolation & role filtering
    if (user.role === 'MANAGEMENT') {
      where.communityId = user.communityId;
    } else if (user.role === 'PROVIDER' && user.providerProfile) {
      where.providerProfileId = user.providerProfile.id;
    } else if (communityId) {
      where.communityId = communityId;
    }

    if (status) {
      where.visitStatus = status;
    }

    if (todayOnly) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      where.createdAt = { gte: startOfDay };
    }

    const visits = await prisma.providerVisit.findMany({
      where,
      include: {
        providerProfile: {
          include: {
            user: { select: { id: true, name: true, avatar: true } }
          }
        },
        serviceRequest: {
          select: {
            id: true,
            requestNumber: true,
            categoryName: true,
            subCategoryName: true,
            block: true,
            flatNumber: true,
            resident: { select: { id: true, name: true } }
          }
        },
        community: {
          select: { id: true, name: true, code: true }
        },
        gate: true,
        auditLogs: {
          orderBy: { timestamp: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const currentlyInsideCount = visits.filter((v) => v.visitStatus === 'INSIDE_APARTMENT').length;

    return NextResponse.json({
      success: true,
      count: visits.length,
      currentlyInsideCount,
      visits
    });
  } catch (error: any) {
    console.error('Error fetching visits:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
