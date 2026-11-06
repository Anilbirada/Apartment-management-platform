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
    const entityType = searchParams.get('entityType'); // 'PROVIDER' | 'BUSINESS'
    const tier = searchParams.get('tier'); // 'GOLD' | 'SILVER' | 'BRONZE'

    const providers = await prisma.providerProfile.findMany({
      where: {
        ...(tier ? { tier } : {})
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            isVerified: true
          }
        },
        tierAudits: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const businesses = await prisma.localBusiness.findMany({
      where: {
        ...(tier ? { tier } : {})
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true
          }
        },
        tierAudits: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      providers: (!entityType || entityType === 'PROVIDER') ? providers : [],
      businesses: (!entityType || entityType === 'BUSINESS') ? businesses : []
    });
  } catch (error: any) {
    console.error('Error fetching memberships:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Platform Administrator privileges required.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      entityType, // 'PROVIDER' | 'BUSINESS'
      entityId,
      tier, // 'GOLD' | 'SILVER' | 'BRONZE'
      status = 'ACTIVE', // 'ACTIVE' | 'EXPIRED' | 'SUSPENDED'
      validityDays,
      reason
    } = body;

    if (!entityType || !entityId || !tier) {
      return NextResponse.json(
        { error: 'Entity type, entity ID, and tier are required.' },
        { status: 400 }
      );
    }

    if (!['GOLD', 'SILVER', 'BRONZE'].includes(tier.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be GOLD, SILVER, or BRONZE.' },
        { status: 400 }
      );
    }

    const upperTier = tier.toUpperCase();
    const effectiveDate = new Date();
    const expiryDate = validityDays ? new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000) : null;

    let previousTier = 'BRONZE';
    let entityName = '';
    let targetUserId = '';

    if (entityType === 'PROVIDER') {
      const existing = await prisma.providerProfile.findUnique({
        where: { id: entityId },
        include: { user: true }
      });
      if (!existing) {
        return NextResponse.json({ error: 'Provider not found.' }, { status: 404 });
      }
      previousTier = existing.tier || 'BRONZE';
      entityName = existing.businessName;
      targetUserId = existing.userId;

      await prisma.providerProfile.update({
        where: { id: entityId },
        data: {
          tier: upperTier,
          tierStatus: status,
          tierEffectiveDate: effectiveDate,
          tierExpiryDate: expiryDate,
          tierAssignedById: user.id
        }
      });
    } else if (entityType === 'BUSINESS') {
      const existing = await prisma.localBusiness.findUnique({
        where: { id: entityId },
        include: { user: true }
      });
      if (!existing) {
        return NextResponse.json({ error: 'Business not found.' }, { status: 404 });
      }
      previousTier = existing.tier || 'BRONZE';
      entityName = existing.businessName;
      targetUserId = existing.userId;

      await prisma.localBusiness.update({
        where: { id: entityId },
        data: {
          tier: upperTier,
          tierStatus: status,
          tierEffectiveDate: effectiveDate,
          tierExpiryDate: expiryDate,
          tierAssignedById: user.id
        }
      });
    } else {
      return NextResponse.json({ error: 'Invalid entity type.' }, { status: 400 });
    }

    // Record in MembershipTierAudit
    const audit = await prisma.membershipTierAudit.create({
      data: {
        entityType: entityType === 'PROVIDER' ? 'PROVIDER' : 'LOCAL_BUSINESS',
        providerProfileId: entityType === 'PROVIDER' ? entityId : undefined,
        localBusinessId: entityType === 'BUSINESS' ? entityId : undefined,
        previousTier,
        newTier: upperTier,
        status,
        effectiveDate,
        expiryDate,
        reason: reason || `Tier manually changed to ${upperTier} by Admin ${user.name}`,
        assignedById: user.id
      }
    });

    // Notify user of tier change
    if (targetUserId) {
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          type: 'PROVIDER_APPROVAL',
          title: `🌟 Membership Tier Updated: ${upperTier}`,
          message: `Your membership tier for ${entityName} has been updated to ${upperTier}. Your profile and listings will now enjoy ${upperTier} priority placement!`,
          link: entityType === 'PROVIDER' ? '/provider/dashboard' : '/business/dashboard'
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `${entityName} tier updated to ${upperTier} successfully.`,
      audit
    });
  } catch (error: any) {
    console.error('Error updating membership tier:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
