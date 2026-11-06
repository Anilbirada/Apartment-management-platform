import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Platform Administrator privileges required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const targetRole = searchParams.get('targetRole');

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (targetRole) {
      where.targetRole = targetRole;
    }

    const applications = await prisma.roleUpgradeApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            role: true,
            isVerified: true,
            createdAt: true
          }
        }
      }
    });

    const parsed = applications.map((app) => ({
      ...app,
      parsedFormData: app.applicationDataJson ? JSON.parse(app.applicationDataJson) : {},
      parsedDocuments: app.documentsJson ? JSON.parse(app.documentsJson) : null
    }));

    return NextResponse.json({
      success: true,
      count: parsed.length,
      applications: parsed
    });
  } catch (error: any) {
    console.error('Error fetching admin upgrade applications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
