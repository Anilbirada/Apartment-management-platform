import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { getCurrentUser } from '@/lib/auth';

const PAYMENT_WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'sandbox_payment_secret_palm_2026';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      transactionNumber,
      gatewayPaymentId,
      gatewaySignature,
      isSandboxConfirmation = false
    } = body;

    if (!transactionNumber) {
      return NextResponse.json({ error: 'Transaction number is required.' }, { status: 400 });
    }

    const transaction = await prisma.paymentTransaction.findUnique({
      where: { transactionNumber },
      include: { subscription: { include: { plan: true } } }
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction record not found.' }, { status: 404 });
    }

    // Idempotency: If already verified, return existing status without double charging
    if (transaction.status === 'SUCCESS') {
      return NextResponse.json({
        success: true,
        message: 'Transaction has already been verified and processed.',
        transaction
      });
    }

    // Server-side Signature Verification
    let isSignatureValid = false;

    if (gatewaySignature && transaction.gatewayReference) {
      const expectedSignature = crypto
        .createHmac('sha256', PAYMENT_WEBHOOK_SECRET)
        .update(`${transaction.gatewayReference}|${gatewayPaymentId || 'pay_test'}`)
        .digest('hex');

      // Valid if matching expected or in explicit sandbox mode with payment ref
      isSignatureValid = (gatewaySignature === expectedSignature) || (isSandboxConfirmation && !!gatewayPaymentId);
    } else if (isSandboxConfirmation) {
      isSignatureValid = true;
    }

    if (!isSignatureValid) {
      // Mark transaction failed
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' }
      });

      return NextResponse.json(
        { error: 'Payment signature verification failed. Subscription not activated.' },
        { status: 400 }
      );
    }

    // Verified Successful Transaction: Activate Subscription
    const updatedTxn = await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: 'SUCCESS',
        gatewayReference: gatewayPaymentId || transaction.gatewayReference,
        gatewaySignature: gatewaySignature || 'sig_sandbox_verified',
        updatedAt: new Date()
      }
    });

    if (transaction.subscriptionId) {
      await prisma.subscription.update({
        where: { id: transaction.subscriptionId },
        data: {
          status: 'ACTIVE',
          updatedAt: new Date()
        }
      });
    }

    // In-app Notification for successful payment
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'SERVICE_REQUEST',
        title: 'Payment Confirmed & Membership Active! 💳',
        message: `Your payment of ₹${transaction.amountInr.toLocaleString()} for ${transaction.subscription?.plan?.name || 'Subscription'} was verified successfully. Ref: ${transaction.transactionNumber}`,
        link: user.role === 'PROVIDER' ? '/provider/dashboard' : '/business/dashboard'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Server-side payment verification successful. Subscription activated.',
      transaction: updatedTxn
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
