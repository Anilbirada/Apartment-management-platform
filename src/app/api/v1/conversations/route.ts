import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { residentId: user.id },
          { providerId: user.id }
        ]
      },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        serviceRequest: {
          select: {
            id: true,
            requestNumber: true,
            categoryName: true,
            status: true
          }
        },
        requirement: {
          select: {
            id: true,
            requirementNumber: true,
            roleTitle: true,
            category: true
          }
        }
      }
    });

    // Populate user counterpart info
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv.residentId === user.id ? conv.providerId : conv.residentId;
        const counterpart = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            isVerified: true
            // Phone is intentionally omitted
          }
        });
        return { ...conv, counterpart };
      })
    );

    return NextResponse.json({ success: true, conversations: enriched });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { targetUserId, serviceRequestId, requirementId, initialMessage } = await req.json();

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 });
    }

    // Check if conversation already exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { residentId: user.id, providerId: targetUserId },
          { residentId: targetUserId, providerId: user.id }
        ],
        ...(serviceRequestId ? { serviceRequestId } : {}),
        ...(requirementId ? { requirementId } : {})
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          residentId: user.role === 'RESIDENT' ? user.id : targetUserId,
          providerId: user.role === 'RESIDENT' ? targetUserId : user.id,
          serviceRequestId: serviceRequestId || null,
          requirementId: requirementId || null,
          lastMessageText: initialMessage || 'Conversation started',
          lastMessageAt: new Date()
        }
      });
    }

    if (initialMessage) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: user.id,
          content: initialMessage,
          isRead: false
        }
      });

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageText: initialMessage,
          lastMessageAt: new Date()
        }
      });
    }

    return NextResponse.json({ success: true, conversation });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
