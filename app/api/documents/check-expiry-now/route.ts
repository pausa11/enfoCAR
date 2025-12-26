import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { sendPushNotificationBatch } from '@/lib/push/send-notification';

/**
 * POST /api/documents/check-expiry-now
 * Manually trigger document expiry check and send notifications
 * Useful for testing or manual triggers
 */
export async function POST(request: NextRequest) {
    try {
        console.log('[CHECK-EXPIRY] Starting document expiry check...');

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        console.log('[CHECK-EXPIRY] User:', user?.id, user?.email);

        if (authError || !user) {
            console.error('[CHECK-EXPIRY] Auth error:', authError);
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        // Find user's documents expiring in the next 30 days
        const expiringDocuments = await prisma.assetDocument.findMany({
            where: {
                isActive: true,
                expirationDate: {
                    gte: now,
                    lte: thirtyDaysFromNow,
                },
                asset: {
                    userId: user.id,
                },
            },
            include: {
                asset: true,
            },
        });

        console.log('[CHECK-EXPIRY] Found documents:', expiringDocuments.length);

        if (expiringDocuments.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No hay documentos próximos a vencer',
                documentsChecked: 0,
            });
        }

        // Get user's push subscriptions
        const userWithSubscriptions = await prisma.user.findUnique({
            where: { email: user.email! },
            include: {
                pushSubscriptions: true,
            },
        });

        console.log('[CHECK-EXPIRY] User subscriptions:', userWithSubscriptions?.pushSubscriptions.length || 0);

        if (!userWithSubscriptions || userWithSubscriptions.pushSubscriptions.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No tienes notificaciones activas',
                documentsFound: expiringDocuments.length,
            });
        }

        const pushSubscriptions = userWithSubscriptions.pushSubscriptions.map(sub => ({
            endpoint: sub.endpoint,
            keys: {
                p256dh: sub.p256dhKey,
                auth: sub.authKey,
            },
        }));

        // Send notifications for each expiring document
        const notificationPromises = expiringDocuments.map(async (document) => {
            const daysUntilExpiry = Math.ceil(
                (document.expirationDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );

            let emoji = '📄';
            if (daysUntilExpiry <= 3) {
                emoji = '🚨';
            } else if (daysUntilExpiry <= 7) {
                emoji = '⚠️';
            }

            const documentTypeNames: Record<string, string> = {
                SOAT: 'SOAT',
                TECNOMECANICA: 'Tecnomecánica',
                POLIZA_TODO_RIESGO: 'Póliza Todo Riesgo',
                IMPUESTO_VEHICULAR: 'Impuesto Vehicular',
                TARJETA_PROPIEDAD: 'Tarjeta de Propiedad',
                OTRO: 'Documento',
            };

            const docTypeName = documentTypeNames[document.type] || 'Documento';

            console.log(`[CHECK-EXPIRY] Sending notification for ${docTypeName} - ${daysUntilExpiry} days`);

            return sendPushNotificationBatch(pushSubscriptions, {
                title: `${emoji} ${docTypeName} por vencer`,
                body: `El ${docTypeName} de ${document.asset.name} vence en ${daysUntilExpiry} día${daysUntilExpiry === 1 ? '' : 's'}`,
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-192.png',
                tag: `document-expiry-${document.id}`,
                requireInteraction: daysUntilExpiry <= 7,
                data: {
                    url: '/app/documentos',
                    documentId: document.id,
                    assetId: document.assetId,
                },
            });
        });

        const results = await Promise.all(notificationPromises);

        const totalSent = results.reduce((sum, r) => sum + r.successful, 0);
        const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);

        console.log('[CHECK-EXPIRY] Results - Sent:', totalSent, 'Failed:', totalFailed);

        return NextResponse.json({
            success: true,
            documentsChecked: expiringDocuments.length,
            notificationsSent: totalSent,
            notificationsFailed: totalFailed,
        });
    } catch (error) {
        console.error('Error checking document expiry:', error);
        return NextResponse.json(
            { error: 'Failed to check document expiry' },
            { status: 500 }
        );
    }
}
