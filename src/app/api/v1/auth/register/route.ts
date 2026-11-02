import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      name,
      phone,
      role = 'RESIDENT', // RESIDENT or PROVIDER
      block,
      flatNumber,
      residentType = 'OWNER',
      // Provider fields
      businessName,
      experienceYears,
      startingPrice,
      serviceArea,
      bio,
      categorySlug,
      idProofType,
      idProofUrl
    } = body;

    if (!email || !password || !name || !phone) {
      return NextResponse.json({ error: 'Missing required credentials' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const community = await prisma.community.findFirst();
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 500 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (role === 'PROVIDER') {
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          name,
          phone,
          role: 'PROVIDER',
          isVerified: false,
          status: 'PENDING',
          communityId: community.id,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
          providerProfile: {
            create: {
              businessName: businessName || `${name} Services`,
              experienceYears: parseInt(experienceYears || '3', 10),
              serviceArea: serviceArea || community.name,
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

      // Add document entry for admin inspection
      if (user.providerProfile) {
        await prisma.providerDocument.create({
          data: {
            providerProfileId: user.providerProfile.id,
            docType: idProofType || 'AADHAAR',
            fileUrl: idProofUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=500&q=80',
            fileName: `${name.replace(/\s+/g, '_')}_ID_Proof.pdf`,
            status: 'PENDING'
          }
        });

        // Create notification for admin
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
        for (const admin of admins) {
          await prisma.notification.create({
            data: {
              userId: admin.id,
              type: 'PROVIDER_APPROVAL',
              title: 'New Service Provider Registration',
              message: `${name} has registered "${businessName || name}" and submitted ID proof for verification.`,
              link: '/admin/approvals'
            }
          });
        }
      }

      const token = signToken({
        userId: user.id,
        email: user.email,
        role: 'PROVIDER',
        communityId: community.id,
        name: user.name
      });

      const res = NextResponse.json({
        success: true,
        message: 'Provider registration submitted. Awaiting society admin verification.',
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
      // Resident registration
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          name,
          phone,
          role: 'RESIDENT',
          isVerified: true,
          status: 'ACTIVE',
          communityId: community.id,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
          residentProfile: {
            create: {
              intercomNumber: flatNumber ? `${flatNumber}` : '101',
              familyMembersCount: 3,
            }
          },
          communityMembers: {
            create: {
              communityId: community.id,
              block: block || 'Tower A',
              flatNumber: flatNumber || '101',
              residentType: residentType || 'OWNER',
              isVerified: true
            }
          }
        },
        include: { residentProfile: true, communityMembers: true }
      });

      const token = signToken({
        userId: user.id,
        email: user.email,
        role: 'RESIDENT',
        communityId: community.id,
        name: user.name
      });

      const res = NextResponse.json({
        success: true,
        message: 'Resident registered successfully.',
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
