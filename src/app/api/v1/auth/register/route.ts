import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken, normalizeEmail, normalizePhone } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      name,
      phone,
      role = 'RESIDENT', // RESIDENT, PROVIDER, BUSINESS
      communityId,
      block,
      flatNumber,
      residentType = 'OWNER',
      // Provider fields
      businessName,
      experienceYears,
      startingPrice,
      serviceArea,
      bio,
      idProofType,
      idProofUrl,
      localities,
      // Local Business fields
      businessCategory,
      businessAddress,
      businessDescription,
      operatingAreas
    } = body;

    if (!email || !password || !name || !phone) {
      return NextResponse.json(
        { error: 'Name, email, mobile number, and password are required' },
        { status: 400 }
      );
    }

    const normEmail = normalizeEmail(email);
    const normPhone = normalizePhone(phone);

    // Enforce global identity uniqueness for both email and mobile
    const existingByEmail = await prisma.user.findUnique({
      where: { email: normEmail }
    });

    if (existingByEmail) {
      return NextResponse.json(
        { error: `An account already exists with email address "${normEmail}". Please log in.` },
        { status: 400 }
      );
    }

    const existingByPhone = await prisma.user.findUnique({
      where: { phone: normPhone }
    });

    if (existingByPhone) {
      return NextResponse.json(
        { error: `An account already exists with mobile number "${normPhone}". Please log in.` },
        { status: 400 }
      );
    }

    // Identify target apartment community
    let targetCommunity = null;
    if (communityId) {
      targetCommunity = await prisma.community.findUnique({ where: { id: communityId } });
    }
    if (!targetCommunity) {
      targetCommunity = await prisma.community.findFirst();
    }

    if (!targetCommunity) {
      return NextResponse.json({ error: 'No active apartment communities found on the platform' }, { status: 500 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (role === 'GUEST') {
      // REQUIREMENT 11 & STATE B: AUTHENTICATED GUEST
      // Create a guest account with no elevated apartment/management permissions
      const user = await prisma.user.create({
        data: {
          email: normEmail,
          phone: normPhone,
          passwordHash,
          name,
          role: 'GUEST',
          isVerified: true,
          status: 'ACTIVE',
          communityId: targetCommunity?.id || null,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
        }
      });

      const token = signToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: 'GUEST',
        communityId: targetCommunity?.id || undefined,
        name: user.name
      });

      const res = NextResponse.json({
        success: true,
        message: 'Guest account created successfully. Welcome to the community!',
        token,
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          isVerified: user.isVerified,
          status: user.status
        }
      });

      res.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60
      });

      return res;
    }

    if (role === 'BUSINESS') {
      // Local Business Registration
      const user = await prisma.user.create({
        data: {
          email: normEmail,
          phone: normPhone,
          passwordHash,
          name,
          role: 'BUSINESS',
          isVerified: false,
          status: 'PENDING',
          communityId: targetCommunity.id,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
          businessProfile: {
            create: {
              businessName: businessName || `${name} Neighborhood Enterprise`,
              category: businessCategory || 'GROCERY',
              description: businessDescription || 'Local neighborhood goods and retail services.',
              address: businessAddress || targetCommunity.address,
              city: targetCommunity.city,
              state: targetCommunity.state,
              postalCode: targetCommunity.postalCode,
              contactPhone: normPhone,
              contactEmail: normEmail,
              operatingAreasJson: JSON.stringify(operatingAreas || [targetCommunity.city]),
              targetApartments: JSON.stringify([targetCommunity.id]),
              isApproved: false,
              verificationStatus: 'PENDING'
            }
          }
        },
        include: { businessProfile: true }
      });

      // Notify platform admin
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'PROVIDER_APPROVAL',
            title: 'New Local Business Registration',
            message: `${name} registered business "${businessName || name}" for approval.`,
            link: '/admin/approvals'
          }
        });
      }

      const token = signToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: 'BUSINESS',
        communityId: targetCommunity.id,
        name: user.name
      });

      const res = NextResponse.json({
        success: true,
        message: 'Local business registered successfully. Awaiting administration activation.',
        token,
        user
      });

      res.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60
      });

      return res;
    } else if (role === 'PROVIDER') {
      // Service Provider Registration
      const user = await prisma.user.create({
        data: {
          email: normEmail,
          phone: normPhone,
          passwordHash,
          name,
          role: 'PROVIDER',
          isVerified: false,
          status: 'PENDING',
          communityId: targetCommunity.id,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
          providerProfile: {
            create: {
              businessName: businessName || `${name} Doorstep Services`,
              experienceYears: parseInt(experienceYears || '3', 10),
              serviceArea: serviceArea || targetCommunity.name,
              bio: bio || 'Professional doorstep service provider.',
              startingPrice: parseFloat(startingPrice || '299'),
              availableToday: true,
              isApproved: false,
              verificationStatus: 'PENDING',
              idProofType: idProofType || 'AADHAAR',
              idProofUrl: idProofUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=500&q=80',
            }
          }
        },
        include: { providerProfile: true }
      });

      if (user.providerProfile) {
        // Document
        await prisma.providerDocument.create({
          data: {
            providerProfileId: user.providerProfile.id,
            docType: idProofType || 'AADHAAR',
            fileUrl: idProofUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=500&q=80',
            fileName: `${name.replace(/\s+/g, '_')}_ID_Proof.pdf`,
            status: 'PENDING'
          }
        });

        // Service Area
        await prisma.providerServiceArea.create({
          data: {
            providerProfileId: user.providerProfile.id,
            country: 'India',
            state: targetCommunity.state,
            city: targetCommunity.city,
            locality: targetCommunity.name,
            postalCode: targetCommunity.postalCode,
            serviceRadiusKm: 5.0,
            communityId: targetCommunity.id
          }
        });

        // Notify admins
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
        for (const admin of admins) {
          await prisma.notification.create({
            data: {
              userId: admin.id,
              type: 'PROVIDER_APPROVAL',
              title: 'New Service Provider Registered',
              message: `${name} has registered "${businessName || name}" with verification documents.`,
              link: '/admin/approvals'
            }
          });
        }
      }

      const token = signToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: 'PROVIDER',
        communityId: targetCommunity.id,
        name: user.name
      });

      const res = NextResponse.json({
        success: true,
        message: 'Provider registration submitted. Verification documents sent to administration.',
        token,
        user
      });

      res.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60
      });

      return res;
    } else {
      // Resident Self-Registration (Option 2)
      // Check onboarding mode
      const isAutoApproved = targetCommunity.onboardingMode === 'MANAGEMENT_INVITE'; // If self-registration allowed, requires society review
      const initialStatus = 'PENDING';

      const user = await prisma.user.create({
        data: {
          email: normEmail,
          phone: normPhone,
          passwordHash,
          name,
          role: 'RESIDENT',
          isVerified: false,
          status: initialStatus,
          communityId: targetCommunity.id,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
          residentProfile: {
            create: {
              intercomNumber: flatNumber ? `${flatNumber}` : '101',
              familyMembersCount: 3,
            }
          }
        },
        include: { residentProfile: true }
      });

      // Create ResidentApplication for Society Management review queue
      await prisma.residentApplication.create({
        data: {
          communityId: targetCommunity.id,
          userId: user.id,
          block: block || 'Tower A',
          flatNumber: flatNumber || '101',
          residentType: residentType || 'OWNER',
          proofDocumentUrl: idProofUrl || null,
          status: 'PENDING'
        }
      });

      // Notify society manager
      if (targetCommunity.managerId) {
        await prisma.notification.create({
          data: {
            userId: targetCommunity.managerId,
            type: 'SERVICE_REQUEST',
            title: 'New Resident Registration Submitted',
            message: `${name} requested membership approval for ${block || 'Tower A'} - ${flatNumber || '101'}.`,
            link: '/management/residents'
          }
        });
      }

      const token = signToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: 'RESIDENT',
        communityId: targetCommunity.id,
        name: user.name
      });

      const res = NextResponse.json({
        success: true,
        message: 'Registration submitted. Awaiting approval by Society Management.',
        token,
        user
      });

      res.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60
      });

      return res;
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
