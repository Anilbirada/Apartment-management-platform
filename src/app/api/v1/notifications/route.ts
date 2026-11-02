import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false }
    });

    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId: user.id }
    });

    return NextResponse.json({
      success: true,
      unreadCount,
      notifications,
      preferences: preferences || {
        pushEnabled: true,
        smsEnabled: true,
        whatsappEnabled: true,
        emailEnabled: true
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { markAllRead, notificationId, preferences } = body;

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true }
      });
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
      });
      return NextResponse.json({ success: true, message: 'Notification marked as read' });
    }

    if (preferences) {
      const updatedPref = await prisma.notificationPreference.upsert({
        where: { userId: user.id },
        update: {
          pushEnabled: preferences.pushEnabled,
          smsEnabled: preferences.smsEnabled,
          whatsappEnabled: preferences.whatsappEnabled,
          emailEnabled: preferences.emailEnabled
        },
        create: {
          userId: user.id,
          pushEnabled: preferences.pushEnabled ?? true,
          smsEnabled: preferences.smsEnabled ?? false,
          whatsappEnabled: preferences.whatsappEnabled ?? false,
          emailEnabled: preferences.emailEnabled ?? true
        }
      });
      return NextResponse.json({ success: true, preferences: updatedPref });
    }

    return NextResponse.json({ error: 'No valid action provided' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
