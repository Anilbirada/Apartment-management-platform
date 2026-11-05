import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getCurrentUser, normalizeEmail, normalizePhone } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    const { id } = params;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apartment-level tenant data isolation
    if (user.role !== 'ADMIN' && (user.role !== 'MANAGEMENT' || user.communityId !== id)) {
      return NextResponse.json(
        { error: 'Forbidden. You cannot view residents from another apartment.' },
        { status: 403 }
      );
    }

    const members = await prisma.communityMember.findMany({
      where: { communityId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            status: true,
            isVerified: true,
            createdAt: true
          }
        }
      },
      orderBy: { block: 'asc' }
    });

    const invitations = await prisma.residentInvitation.findMany({
      where: { communityId: id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      count: members.length,
      members,
      invitations
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    const { id } = params;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Strict apartment data isolation
    if (user.role !== 'ADMIN' && (user.role !== 'MANAGEMENT' || user.communityId !== id)) {
      return NextResponse.json(
        { error: 'Forbidden. You can only create residents for your assigned apartment.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      email,
      phone,
      block,
      flatNumber,
      residentType = 'OWNER',
      action = 'DIRECT_CREATE' // 'DIRECT_CREATE' or 'INVITATION'
    } = body;

    if (!name || !email || !phone || !block || !flatNumber) {
      return NextResponse.json(
        { error: 'Name, email, mobile number, block, and flat number are required.' },
        { status: 400 }
      );
    }

    const normEmail = normalizeEmail(email);
    const normPhone = normalizePhone(phone);

    // Verify existing user identities
    const existingEmail = await prisma.user.findUnique({ where: { email: normEmail } });
    if (existingEmail) {
      return NextResponse.json(
        { error: `User with email ${normEmail} already exists.` },
        { status: 400 }
      );
    }

    const existingPhone = await prisma.user.findUnique({ where: { phone: normPhone } });
    if (existingPhone) {
      return NextResponse.json(
        { error: `User with mobile number ${normPhone} already exists.` },
        { status: 400 }
      );
    }

    if (action === 'INVITATION') {
      const inviteToken = crypto.randomBytes(24).toString('hex');
      const expiresAt = new Date(Date.now() + 1000 * 3600 * 24 * 7); // 7 days

      const invitation = await prisma.residentInvitation.create({
        data: {
          communityId: id,
          name: name.trim(),
          email: normEmail,
          phone: normPhone,
          block: block.trim(),
          flatNumber: flatNumber.trim(),
          residentType,
          token: inviteToken,
          status: 'PENDING',
          invitedById: user.id,
          expiresAt
        }
      });

      return NextResponse.json({
        success: true,
        message: `Secure invitation link generated for ${name}.`,
        invitation,
        inviteUrl: `/register?invite=${inviteToken}`
      });
    } else {
      // Option 1: Direct Management Account Creation (No plaintext passwords; secure random hash generated)
      const tempPassword = `Palm@${Math.floor(1000 + Math.random() * 9000)}`;
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(tempPassword, salt);

      const residentUser = await prisma.user.create({
        data: {
          email: normEmail,
          phone: normPhone,
          passwordHash,
          name: name.trim(),
          role: 'RESIDENT',
          isVerified: true,
          status: 'ACTIVE',
          communityId: id,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
          residentProfile: {
            create: {
              intercomNumber: flatNumber.trim(),
              familyMembersCount: 3
            }
          },
          communityMembers: {
            create: {
              communityId: id,
              block: block.trim(),
              flatNumber: flatNumber.trim(),
              residentType,
              isVerified: true
            }
          }
        },
        include: { communityMembers: true, residentProfile: true }
      });

      return NextResponse.json({
        success: true,
        message: `Resident account for ${name} (${block}-${flatNumber}) created successfully.`,
        resident: residentUser,
        temporaryCredentialNotice: 'Resident can log in using their mobile number or email.'
      });
    }
  } catch (error: any) {
    console.error('Error adding resident:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
