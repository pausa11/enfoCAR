import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { sendPushNotificationBatch } from '@/lib/push/send-notification';

/**
 * POST /api/reminders/send-now
 * Manually trigger daily reminder (for testing)
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

        // Get user's push subscriptions
        const userWithSubscriptions = await prisma.user.findUnique({
            where: { email: user.email! },
            include: {
                pushSubscriptions: true,
            },
        });

        if (!userWithSubscriptions || userWithSubscriptions.pushSubscriptions.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No tienes notificaciones activas',
            });
        }

        const pushSubscriptions = userWithSubscriptions.pushSubscriptions.map(sub => ({
            endpoint: sub.endpoint,
            keys: {
                p256dh: sub.p256dhKey,
                auth: sub.authKey,
            },
        }));

        const now = new Date();
        const hour = now.getHours();

        // Determine message based on time
        let reminderMessage;
        let reminderTitle;
        let emoji;

        if (hour >= 17 && hour < 21) {
            emoji = '💰';
            reminderTitle = '¡Hora de registrar tus movimientos!';
            reminderMessage = 'No olvides registrar tus gastos e ingresos de hoy. Los datos valen oro 💎';
        } else {
            emoji = '📊';
            reminderTitle = 'Recordatorio financiero';
            reminderMessage = '¿Ya registraste todos tus movimientos de hoy? Mantén tu control financiero al día 🎯';
        }

        // Send reminder
        const result = await sendPushNotificationBatch(pushSubscriptions, {
            title: `${emoji} ${reminderTitle}`,
            body: reminderMessage,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            tag: 'daily-reminder-test',
            requireInteraction: false,
            data: {
                url: '/app/finanzas',
                type: 'daily-reminder',
            },
        });

        return NextResponse.json({
            success: true,
            notificationsSent: result.successful,
            notificationsFailed: result.failed,
        });
    } catch (error) {
        console.error('Error sending reminder:', error);
        return NextResponse.json(
            { error: 'Failed to send reminder' },
            { status: 500 }
        );
    }
}
