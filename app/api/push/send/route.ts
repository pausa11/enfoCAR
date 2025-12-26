import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { sendPushNotification, sendPushNotificationBatch, type NotificationPayload } from '@/lib/push/send-notification';

/**
 * POST /api/push/send
 * Send push notifications to users
 * Body: {
 *   userId?: string,  // Send to specific user
 *   broadcast?: boolean,  // Send to all users
 *   notification: NotificationPayload
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { userId, broadcast, notification } = body;

        if (!notification || !notification.title || !notification.body) {
            return NextResponse.json(
                { error: 'Invalid notification payload' },
                { status: 400 }
            );
        }

        const payload: NotificationPayload = {
            title: notification.title,
            body: notification.body,
            icon: notification.icon || '/icons/icon-192.png',
            badge: notification.badge || '/icons/icon-192.png',
            data: notification.data,
            tag: notification.tag,
            requireInteraction: notification.requireInteraction || false,
            actions: notification.actions,
        };

        if (broadcast) {
            // Send to all subscriptions
            const subscriptions = await prisma.pushSubscription.findMany({
                select: {
                    endpoint: true,
                    p256dhKey: true,
                    authKey: true,
                },
            });

            const pushSubscriptions = subscriptions.map((sub: { endpoint: string; p256dhKey: string; authKey: string }) => ({
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dhKey,
                    auth: sub.authKey,
                },
            }));

            const result = await sendPushNotificationBatch(pushSubscriptions, payload);

            // Clean up expired subscriptions
            if (result.expired.length > 0) {
                await prisma.pushSubscription.deleteMany({
                    where: {
                        endpoint: {
                            in: result.expired,
                        },
                    },
                });
            }

            return NextResponse.json({
                success: true,
                sent: result.successful,
                failed: result.failed,
                expired: result.expired.length,
            });
        } else if (userId) {
            // Send to specific user
            const subscriptions = await prisma.pushSubscription.findMany({
                where: { userId },
                select: {
                    endpoint: true,
                    p256dhKey: true,
                    authKey: true,
                },
            });

            if (subscriptions.length === 0) {
                return NextResponse.json(
                    { error: 'User has no active subscriptions' },
                    { status: 404 }
                );
            }

            const pushSubscriptions = subscriptions.map((sub: { endpoint: string; p256dhKey: string; authKey: string }) => ({
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dhKey,
                    auth: sub.authKey,
                },
            }));

            const result = await sendPushNotificationBatch(pushSubscriptions, payload);

            // Clean up expired subscriptions
            if (result.expired.length > 0) {
                await prisma.pushSubscription.deleteMany({
                    where: {
                        endpoint: {
                            in: result.expired,
                        },
                    },
                });
            }

            return NextResponse.json({
                success: true,
                sent: result.successful,
                failed: result.failed,
                expired: result.expired.length,
            });
        } else {
            return NextResponse.json(
                { error: 'Either userId or broadcast must be specified' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Error sending push notification:', error);
        return NextResponse.json(
            { error: 'Failed to send push notification' },
            { status: 500 }
        );
    }
}
