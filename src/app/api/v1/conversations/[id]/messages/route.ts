import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true
              }
            }
          }
        },
        serviceRequest: true,
        requirement: true
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Verify user is a participant
    if (conversation.residentId !== user.id && conversation.providerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized to view this conversation' }, { status: 403 });
    }

    // Mark messages from other user as read
    await prisma.message.updateMany({
      where: {
        conversationId: params.id,
        senderId: { not: user.id },
        isRead: false
      },
      data: { isRead: true }
    });

    const otherUserId = conversation.residentId === user.id ? conversation.providerId : conversation.residentId;
    const counterpart = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: {
        id: true,
        name: true,
        avatar: true,
        role: true,
        isVerified: true
      }
    });

    return NextResponse.json({
      success: true,
      conversation: {
        ...conversation,
        counterpart
      }
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
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { content, attachmentUrl } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message content cannot be empty' }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.residentId !== user.id && conversation.providerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized to send message in this thread' }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: params.id,
        senderId: user.id,
        content: content.trim(),
        attachmentUrl: attachmentUrl || null,
        isRead: false
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true, role: true }
        }
      }
    });

    await prisma.conversation.update({
      where: { id: params.id },
      data: {
        lastMessageText: content.trim(),
        lastMessageAt: new Date()
      }
    });

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
