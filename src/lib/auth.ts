import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-token-apartment-management-saas-2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'RESIDENT' | 'PROVIDER' | 'MANAGEMENT' | 'ADMIN';
  communityId?: string;
  name: string;
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
        }
      },
      communityMembers: {
        include: { community: true }
      },
      community: true
    }
  });

  return user;
}

export function roleGuard(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}
