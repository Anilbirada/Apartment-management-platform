import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentUser(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Platform Administrator privileges required.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const { action, reason, initialTier = 'BRONZE', targetCommunityId } = body;

    if (!action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be either APPROVE or REJECT.' },
        { status: 400 }
      );
    }

    if (action === 'REJECT' && !reason) {
      return NextResponse.json(
        { error: 'A mandatory rejection reason is required when declining an application.' },
        { status: 400 }
      );
    }

    const application = await prisma.roleUpgradeApplication.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!application) {
      return NextResponse.json({ error: 'Upgrade application not found.' }, { status: 404 });
    }

    const formData = application.applicationDataJson ? JSON.parse(application.applicationDataJson) : {};

    if (action === 'REJECT') {
      const updated = await prisma.roleUpgradeApplication.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectionReason: reason,
          reviewedById: admin.id,
          reviewedAt: new Date()
        }
      });

      // Notify the applicant
      await prisma.notification.create({
        data: {
          userId: application.userId,
          type: 'PROVIDER_APPROVAL',
          title: `Role Upgrade Application Update`,
          message: `Your application for ${application.targetRole} was not approved. Reason: ${reason}`,
          link: '/guest/dashboard'
        }
      });

      return NextResponse.json({
        success: true,
        message: `Application declined. Notification sent to ${application.user.name}.`,
        application: updated
      });
    }

    // APPROVE WORKFLOW
    const targetRole = application.targetRole;
    const assignedTier = (['GOLD', 'SILVER', 'BRONZE'].includes(initialTier?.toUpperCase()) ? initialTier.toUpperCase() : 'BRONZE') as 'GOLD' | 'SILVER' | 'BRONZE';

    // 1. Update User Role & Verification
    await prisma.user.update({
      where: { id: application.userId },
      data: {
        role: targetRole,
        isVerified: true,
        status: 'ACTIVE'
      }
    });

    // 2. Role-specific profile initialization
    let commId: string | null = null;

    if (targetRole === 'PROVIDER') {
      const provider = await prisma.providerProfile.upsert({
        where: { userId: application.userId },
        create: {
          userId: application.userId,
          businessName: formData.businessName || `${application.user.name} Services`,
          experienceYears: parseInt(formData.experienceYears || '3', 10),
          serviceArea: formData.serviceArea || 'Bengaluru',
          bio: formData.bio || 'Verified professional service provider.',
          startingPrice: parseFloat(formData.startingPrice || '299'),
          availableToday: true,
          isApproved: true,
          verificationStatus: 'APPROVED',
          tier: assignedTier,
          tierStatus: 'ACTIVE',
          tierEffectiveDate: new Date(),
          tierAssignedById: admin.id,
          idProofType: formData.idProofType || 'AADHAAR',
          idProofUrl: formData.idProofUrl || null
        },
        update: {
          businessName: formData.businessName || `${application.user.name} Services`,
          experienceYears: parseInt(formData.experienceYears || '3', 10),
          serviceArea: formData.serviceArea || 'Bengaluru',
          bio: formData.bio || 'Verified professional service provider.',
          startingPrice: parseFloat(formData.startingPrice || '299'),
          availableToday: true,
          isApproved: true,
          verificationStatus: 'APPROVED',
          tier: assignedTier,
          tierStatus: 'ACTIVE',
          tierEffectiveDate: new Date(),
          tierAssignedById: admin.id
        }
      });

      // Record in MembershipTierAudit
      await prisma.membershipTierAudit.create({
        data: {
          entityType: 'PROVIDER',
          providerProfileId: provider.id,
          previousTier: 'NONE',
          newTier: assignedTier,
          reason: `Initial membership tier assigned upon approval by Platform Admin ${admin.name}`,
          assignedById: admin.id
        }
      });

      // Create initial listing if service category was selected
      if (formData.serviceCategory) {
        const cat = await prisma.category.findFirst({
          where: { OR: [{ slug: formData.serviceCategory }, { name: formData.serviceCategory }] }
        });
        if (cat) {
          await prisma.serviceListing.create({
            data: {
              providerProfileId: provider.id,
              categoryId: cat.id,
              title: `${formData.businessName || application.user.name} - ${cat.name}`,
              description: formData.bio || `Professional ${cat.name} doorstep services.`,
              priceType: 'STARTING_PRICE',
              price: parseFloat(formData.startingPrice || '299'),
              visibility: 'APARTMENT_ONLY',
              status: 'PUBLISHED'
            }
          });
        }
      }
    } else if (targetRole === 'BUSINESS') {
      const business = await prisma.localBusiness.upsert({
        where: { userId: application.userId },
        create: {
          userId: application.userId,
          businessName: formData.businessName || `${application.user.name} Local Business`,
          category: formData.category || 'GROCERY',
          description: formData.description || 'Verified local neighborhood retail establishment.',
          address: formData.address || 'Local Community Commercial Area',
          city: formData.city || 'Bengaluru',
          state: formData.state || 'Karnataka',
          postalCode: formData.postalCode || '560103',
          contactPhone: formData.contactPhone || application.user.phone || '',
          contactEmail: formData.contactEmail || application.user.email,
          logoUrl: formData.logoUrl || null,
          bannerUrl: formData.bannerUrl || null,
          isApproved: true,
          verificationStatus: 'APPROVED',
          status: 'ACTIVE',
          tier: assignedTier,
          tierStatus: 'ACTIVE',
          tierEffectiveDate: new Date(),
          tierAssignedById: admin.id,
          targetApartments: JSON.stringify(formData.targetApartments || [])
        },
        update: {
          businessName: formData.businessName || `${application.user.name} Local Business`,
          category: formData.category || 'GROCERY',
          description: formData.description || 'Verified local neighborhood retail establishment.',
          address: formData.address || 'Local Community Commercial Area',
          isApproved: true,
          verificationStatus: 'APPROVED',
          status: 'ACTIVE',
          tier: assignedTier,
          tierStatus: 'ACTIVE',
          tierEffectiveDate: new Date(),
          tierAssignedById: admin.id
        }
      });

      // Record in MembershipTierAudit
      await prisma.membershipTierAudit.create({
        data: {
          entityType: 'LOCAL_BUSINESS',
          localBusinessId: business.id,
          previousTier: 'NONE',
          newTier: assignedTier,
          reason: `Initial membership tier assigned upon approval by Platform Admin ${admin.name}`,
          assignedById: admin.id
        }
      });
    } else if (targetRole === 'MANAGEMENT') {
      commId = targetCommunityId || formData.targetCommunityId || application.assignedCommunityId;
      if (commId) {
        await prisma.community.update({
          where: { id: commId },
          data: { managerId: application.userId }
        });
        await prisma.user.update({
          where: { id: application.userId },
          data: { communityId: commId }
        });
      }
    }

    // 3. Mark Application Approved
    const updated = await prisma.roleUpgradeApplication.update({
      where: { id },
      data: {
        status: 'APPROVED',
        assignedTier: assignedTier,
        assignedCommunityId: commId || null,
        reviewedById: admin.id,
        reviewedAt: new Date()
      }
    });

    // 4. Send Approval Notification to User
    await prisma.notification.create({
      data: {
        userId: application.userId,
        type: 'PROVIDER_APPROVAL',
        title: `🎉 Congratulations! Your ${targetRole} application is approved!`,
        message: `Your account has been upgraded to ${targetRole}. You can now access your dedicated professional dashboard.`,
        link: targetRole === 'PROVIDER' ? '/provider/dashboard' : targetRole === 'BUSINESS' ? '/business/dashboard' : '/management/dashboard'
      }
    });

    return NextResponse.json({
      success: true,
      message: `Application approved successfully. User ${application.user.name} is now upgraded to ${targetRole}.`,
      application: updated
    });
  } catch (error: any) {
    console.error('Error reviewing upgrade application:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
