import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'AUTHENTICATION_REQUIRED', message: 'You must be logged in to view your applications.' },
        { status: 401 }
      );
    }

    const applications = await prisma.roleUpgradeApplication.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    const parsed = applications.map((app) => ({
      ...app,
      parsedFormData: app.applicationDataJson ? JSON.parse(app.applicationDataJson) : {},
      parsedDocuments: app.documentsJson ? JSON.parse(app.documentsJson) : null
    }));

    return NextResponse.json({
      success: true,
      applications: parsed
    });
  } catch (error: any) {
    console.error('Error fetching guest applications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
