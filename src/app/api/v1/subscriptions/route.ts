import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { userId: user.id },
      include: {
        plan: true,
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const activeSubscription = subscriptions.find(
      (s) => s.status === 'ACTIVE' && new Date(s.currentPeriodEnd) >= new Date()
    );

    return NextResponse.json({
      success: true,
      hasActiveSubscription: !!activeSubscription,
      activeSubscription: activeSubscription || null,
      history: subscriptions
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { planId, paymentMethod = 'UPI' } = body;

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required.' }, { status: 400 });
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: 'Subscription plan not found or inactive.' }, { status: 404 });
    }

    const now = new Date();
    const daysToAdd = plan.billingCycle === 'ANNUAL' ? 365 : plan.billingCycle === 'QUARTERLY' ? 90 : 30;
    const periodEnd = new Date(now.getTime() + 1000 * 3600 * 24 * daysToAdd);

    if (plan.planType === 'FREE' || plan.priceInr === 0) {
      // Free Account Plan: Activates immediately without payment
      const subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: plan.id,
          targetRole: plan.targetRole,
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          autoRenew: false
        },
        include: { plan: true }
      });

      return NextResponse.json({
        success: true,
        message: `Free membership on ${plan.name} activated successfully.`,
        subscription
      });
    }

    // Paid Plan: Create subscription in PENDING_PAYMENT & initiate PaymentTransaction
    const txnNumber = `TXN-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        targetRole: plan.targetRole,
        status: 'PENDING_PAYMENT',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        autoRenew: true
      },
      include: { plan: true }
    });

    const transaction = await prisma.paymentTransaction.create({
      data: {
        transactionNumber: txnNumber,
        userId: user.id,
        subscriptionId: subscription.id,
        amountInr: plan.priceInr,
        currency: 'INR',
        status: 'INITIATED',
        paymentMethod,
        gatewayReference: `order_sandbox_${crypto.randomBytes(8).toString('hex')}`
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Payment order initiated. Awaiting server-verified payment completion.',
      subscription,
      transaction,
      checkoutDetails: {
        transactionNumber: transaction.transactionNumber,
        amountInr: transaction.amountInr,
        planName: plan.name,
        currency: 'INR',
        gatewayOrderId: transaction.gatewayReference
      }
    });
  } catch (error: any) {
    console.error('Subscription purchase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
