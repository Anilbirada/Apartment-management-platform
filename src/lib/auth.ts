import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-token-apartment-management-saas-2026';

export type UserRole = 'GUEST' | 'RESIDENT' | 'PROVIDER' | 'MANAGEMENT' | 'BUSINESS' | 'ADMIN';

export interface TokenPayload {
  userId: string;
  email: string;
  phone?: string;
  role: UserRole;
  communityId?: string;
  name: string;
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function normalizePhone(phone: string): string {
  // Strip all non-digit characters except leading +
  let cleaned = phone.replace(/[^\d+]/g, '').trim();
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  // If 10 digits without country code, add +91 (standard Indian format)
  if (/^\d{10}$/.test(cleaned)) {
    cleaned = `+91${cleaned}`;
  } else if (/^91\d{10}$/.test(cleaned)) {
    cleaned = `+${cleaned}`;
  } else if (!cleaned.startsWith('+')) {
    cleaned = `+${cleaned}`;
  }
  return cleaned;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(req: NextRequest) {
  // Check auth header or cookie
  const authHeader = req.headers.get('authorization');
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    token = req.cookies.get('token')?.value;
  }

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      residentProfile: true,
      providerProfile: {
        include: {
          documents: true,
          listings: true,
          serviceAreas: true
        }
      },
      businessProfile: {
        include: {
          campaigns: true
        }
      },
      communityMembers: {
        include: { community: true }
      },
      community: true,
      subscriptions: {
        where: { status: 'ACTIVE' },
        include: { plan: true }
      }
    }
  });

  return user;
}

export function roleGuard(userRole: string, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole as UserRole);
}
