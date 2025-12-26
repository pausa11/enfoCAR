import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushNotificationBatch } from '@/lib/push/send-notification';

/**
 * GET /api/cron/daily-reminder
 * Send daily reminders to users to register their financial movements
 * Should be called twice daily (6 PM and 9 PM)
 */
export async function GET(request: NextRequest) {
    try {
        // Verify cron secret for security (optional but recommended)
        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const hour = now.getHours();

        // Determine which reminder message to send based on time
        let reminderMessage;
        let reminderTitle;
        let emoji;

        if (hour >= 17 && hour < 20) {
            // 6 PM reminder (17:00-19:59)
            emoji = '💰';
            reminderTitle = '¡Hora de registrar tus movimientos!';
            reminderMessage = 'No olvides registrar tus gastos e ingresos de hoy. Los datos valen oro 💎';
        } else {
            // 9 PM reminder (21:00+)
            emoji = '📊';
            reminderTitle = 'Último recordatorio del día';
            reminderMessage = '¿Ya registraste todos tus movimientos de hoy? Mantén tu control financiero al día 🎯';
        }

        // Get all users with active push subscriptions
        const usersWithSubscriptions = await prisma.user.findMany({
            where: {
                pushSubscriptions: {
                    some: {},
                },
            },
            include: {
                pushSubscriptions: true,
            },
        });

        console.log(`[DAILY-REMINDER] Found ${usersWithSubscriptions.length} users with subscriptions`);

        let notificationsSent = 0;
        const notificationPromises: Promise<any>[] = [];

        for (const user of usersWithSubscriptions) {
            if (user.pushSubscriptions.length === 0) continue;

            const pushSubscriptions = user.pushSubscriptions.map(sub => ({
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dhKey,
                    auth: sub.authKey,
                },
            }));

            // Send reminder notification
            const notificationPromise = sendPushNotificationBatch(pushSubscriptions, {
                title: `${emoji} ${reminderTitle}`,
                body: reminderMessage,
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-192.png',
                tag: `daily-reminder-${hour}`,
                requireInteraction: false,
                data: {
                    url: '/app/finanzas',
                    type: 'daily-reminder',
                },
            }).then(async (result) => {
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
                return result;
            });

            notificationPromises.push(notificationPromise);
            notificationsSent++;
        }

        // Wait for all notifications to be sent
        await Promise.all(notificationPromises);

        console.log(`[DAILY-REMINDER] Sent ${notificationsSent} reminders at ${hour}:00`);

        return NextResponse.json({
            success: true,
            usersNotified: notificationsSent,
            reminderTime: `${hour}:00`,
            timestamp: now.toISOString(),
        });
    } catch (error) {
        console.error('Error sending daily reminders:', error);
        return NextResponse.json(
            { error: 'Failed to send daily reminders' },
            { status: 500 }
        );
    }
}
