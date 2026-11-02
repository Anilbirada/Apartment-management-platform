import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { targetType, targetId, reason, notes } = await req.json();

    if (!targetType || !targetId || !reason) {
      return NextResponse.json({ error: 'Target type, target ID, and reason are required' }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        targetType, // 'LISTING' | 'REVIEW' | 'PROVIDER' | 'REQUIREMENT'
        targetId,
        reason,
        notes: notes || null,
        status: 'PENDING'
      }
    });

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'SERVICE_REQUEST',
          title: `New Content Report (${targetType})`,
          message: `${user.name} reported a ${targetType.toLowerCase()} for "${reason}".`,
          link: '/admin/approvals'
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Report submitted. Society administrators will inspect the content.',
      report
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
