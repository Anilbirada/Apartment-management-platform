import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    // 1. All completed payment transactions
    const successfulPayments = await prisma.paymentTransaction.findMany({
      where: { status: 'SUCCESS' },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        subscription: { include: { plan: true } },
        campaign: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const pendingPaymentsCount = await prisma.paymentTransaction.count({
      where: { status: { in: ['INITIATED', 'PENDING'] } }
    });

    const failedPaymentsCount = await prisma.paymentTransaction.count({
      where: { status: 'FAILED' }
    });

    // 2. Revenue calculations strictly from real database records
    let totalRevenue = 0;
    let subscriptionRevenue = 0;
    let providerSubscriptionRevenue = 0;
    let businessSubscriptionRevenue = 0;
    let campaignRevenue = 0;

    for (const p of successfulPayments) {
      totalRevenue += p.amountInr;
      if (p.subscription) {
        subscriptionRevenue += p.amountInr;
        if (p.subscription.targetRole === 'PROVIDER') {
          providerSubscriptionRevenue += p.amountInr;
        } else if (p.subscription.targetRole === 'LOCAL_BUSINESS') {
          businessSubscriptionRevenue += p.amountInr;
        }
      }
      if (p.campaign) {
        campaignRevenue += p.amountInr;
      }
    }

    // 3. Subscriptions breakdown
    const now = new Date();
    const activeSubscriptions = await prisma.subscription.count({
      where: {
        status: 'ACTIVE',
        currentPeriodEnd: { gte: now }
      }
    });

    const expiredSubscriptions = await prisma.subscription.count({
      where: {
        OR: [
          { status: 'EXPIRED' },
          { currentPeriodEnd: { lt: now } }
        ]
      }
    });

    // 4. Provider stats: Paid vs Free
    const totalApprovedProviders = await prisma.providerProfile.count({
      where: { isApproved: true }
    });

    const activePaidProvidersCount = await prisma.subscription.count({
      where: {
        targetRole: 'PROVIDER',
        status: 'ACTIVE',
        plan: { planType: 'PAID' },
        currentPeriodEnd: { gte: now }
      }
    });

    const freeProvidersCount = Math.max(0, totalApprovedProviders - activePaidProvidersCount);

    // 5. Local Business stats: Paid vs Free
    const totalApprovedBusinesses = await prisma.localBusiness.count({
      where: { isApproved: true }
    });

    const activePaidBusinessesCount = await prisma.subscription.count({
      where: {
        targetRole: 'LOCAL_BUSINESS',
        status: 'ACTIVE',
        plan: { planType: 'PAID' },
        currentPeriodEnd: { gte: now }
      }
    });

    const freeBusinessesCount = Math.max(0, totalApprovedBusinesses - activePaidBusinessesCount);

    // 6. Recent Payment History
    const recentPayments = successfulPayments.slice(0, 20).map((p) => ({
      id: p.id,
      transactionNumber: p.transactionNumber,
      userName: p.user?.name || 'User',
      userRole: p.user?.role || 'N/A',
      amountInr: p.amountInr,
      paymentMethod: p.paymentMethod,
      gatewayReference: p.gatewayReference,
      item: p.subscription?.plan?.name || p.campaign?.title || 'Platform Service',
      date: p.createdAt
    }));

    // 7. Revenue by month (grouped dynamically)
    const monthlyMap: Record<string, number> = {};
    for (const p of successfulPayments) {
      const d = new Date(p.createdAt);
      const key = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + p.amountInr;
    }

    const revenueByMonth = Object.entries(monthlyMap).map(([month, revenue]) => ({
      month,
      revenue
    }));

    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenue,
        subscriptionRevenue,
        providerSubscriptionRevenue,
        businessSubscriptionRevenue,
        campaignRevenue,
        activeSubscriptions,
        expiredSubscriptions,
        pendingPaymentsCount,
        failedPaymentsCount,
        activePaidProvidersCount,
        freeProvidersCount,
        activePaidBusinessesCount,
        freeBusinessesCount,
        totalTransactionsCount: successfulPayments.length
      },
      revenueByMonth,
      recentPayments
    });
  } catch (error: any) {
    console.error('Monetization dashboard error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
