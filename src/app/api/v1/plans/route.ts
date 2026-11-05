import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role'); // 'PROVIDER' or 'LOCAL_BUSINESS'

    const where: any = { isActive: true };
    if (role) {
      where.targetRole = role;
    }

    const plans = await prisma.subscriptionPlan.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json({ success: true, count: plans.length, plans });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin permissions required.' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      targetRole,
      planType = 'PAID',
      priceInr = 0,
      billingCycle = 'MONTHLY',
      description,
      featureEntitlements = {},
      isActive = true,
      sortOrder = 0
    } = body;

    if (!name || !targetRole || !description) {
      return NextResponse.json(
        { error: 'Plan name, target role, and description are required.' },
        { status: 400 }
      );
    }

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: name.trim(),
        targetRole,
        planType,
        priceInr: parseFloat(priceInr) || 0,
        billingCycle,
        description: description.trim(),
        featureEntitlementsJson: JSON.stringify(featureEntitlements),
        isActive,
        sortOrder: parseInt(sortOrder, 10) || 0
      }
    });

    return NextResponse.json({ success: true, message: 'Plan created successfully.', plan });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
