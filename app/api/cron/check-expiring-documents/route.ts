import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushNotificationBatch } from '@/lib/push/send-notification';

/**
 * GET /api/cron/check-expiring-documents
 * Cron job to check for expiring documents and send notifications
 * Should be called daily (e.g., via Vercel Cron or external service)
 */
export async function GET(request: NextRequest) {
    try {
        // Verify cron secret for security (optional but recommended)
        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        // Find documents expiring in the next 30 days
        const expiringDocuments = await prisma.assetDocument.findMany({
            where: {
                isActive: true,
                expirationDate: {
                    gte: now,
                    lte: thirtyDaysFromNow,
                },
            },
            include: {
                asset: {
                    include: {
                        user: {
                            include: {
                                pushSubscriptions: true,
                            },
                        },
                    },
                },
            },
        });

        let notificationsSent = 0;
        const notificationPromises: Promise<any>[] = [];

        for (const document of expiringDocuments) {
            const daysUntilExpiry = Math.ceil(
                (document.expirationDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );

            // Only notify at specific intervals: 30, 15, 7, 3, 1 days
            const shouldNotify = [30, 15, 7, 3, 1].includes(daysUntilExpiry);

            if (!shouldNotify || document.asset.user.pushSubscriptions.length === 0) {
                continue;
            }

            // Determine urgency level
            let emoji = '📄';
            let urgency = '';
            if (daysUntilExpiry <= 3) {
                emoji = '🚨';
                urgency = '¡URGENTE! ';
            } else if (daysUntilExpiry <= 7) {
                emoji = '⚠️';
                urgency = '¡Atención! ';
            }

            // Get document type in Spanish
            const documentTypeNames: Record<string, string> = {
                SOAT: 'SOAT',
                TECNOMECANICA: 'Tecnomecánica',
                POLIZA_TODO_RIESGO: 'Póliza Todo Riesgo',
                IMPUESTO_VEHICULAR: 'Impuesto Vehicular',
                TARJETA_PROPIEDAD: 'Tarjeta de Propiedad',
                OTRO: 'Documento',
            };

            const docTypeName = documentTypeNames[document.type] || 'Documento';
            const assetName = document.asset.name;

            // Prepare push subscriptions
            const pushSubscriptions = document.asset.user.pushSubscriptions.map(sub => ({
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dhKey,
                    auth: sub.authKey,
                },
            }));

            // Send notification
            const notificationPromise = sendPushNotificationBatch(pushSubscriptions, {
                title: `${emoji} ${urgency}${docTypeName} por vencer`,
                body: `El ${docTypeName} de ${assetName} vence en ${daysUntilExpiry} día${daysUntilExpiry === 1 ? '' : 's'}`,
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-192.png',
                tag: `document-expiry-${document.id}`,
                requireInteraction: daysUntilExpiry <= 7,
                data: {
                    url: '/app/documentos',
                    documentId: document.id,
                    assetId: document.assetId,
                },
            }).then(result => {
                // Clean up expired subscriptions
                if (result.expired.length > 0) {
                    return prisma.pushSubscription.deleteMany({
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

        return NextResponse.json({
            success: true,
            documentsChecked: expiringDocuments.length,
            notificationsSent,
            timestamp: now.toISOString(),
        });
    } catch (error) {
        console.error('Error checking expiring documents:', error);
        return NextResponse.json(
            { error: 'Failed to check expiring documents' },
            { status: 500 }
        );
    }
}
