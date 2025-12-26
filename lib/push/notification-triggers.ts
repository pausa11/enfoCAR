/**
 * Utility functions for sending push notifications for key events
 */

export interface NotificationTrigger {
    userId: string;
    title: string;
    body: string;
    url?: string;
    icon?: string;
    tag?: string;
}

/**
 * Send a push notification to a specific user
 */
export async function sendNotificationToUser(trigger: NotificationTrigger): Promise<boolean> {
    try {
        const response = await fetch('/api/push/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: trigger.userId,
                notification: {
                    title: trigger.title,
                    body: trigger.body,
                    icon: trigger.icon || '/icons/icon-192.png',
                    badge: '/icons/icon-192.png',
                    tag: trigger.tag,
                    data: {
                        url: trigger.url || '/',
                    },
                },
            }),
        });

        return response.ok;
    } catch (error) {
        console.error('Error sending notification:', error);
        return false;
    }
}

/**
 * Notification triggers for common events
 */

export async function notifyDocumentExpiring(userId: string, documentType: string, assetName: string, daysUntilExpiry: number) {
    return sendNotificationToUser({
        userId,
        title: `📄 ${documentType} próximo a vencer`,
        body: `El ${documentType} de ${assetName} vence en ${daysUntilExpiry} días`,
        url: '/app/documentos',
        tag: `document-expiry-${documentType}`,
    });
}

export async function notifyMaintenanceDue(userId: string, assetName: string, maintenanceType: string) {
    return sendNotificationToUser({
        userId,
        title: `🔧 Mantenimiento programado`,
        body: `${assetName} requiere ${maintenanceType}`,
        url: '/app/mantenimientos',
        tag: `maintenance-due-${assetName}`,
    });
}

export async function notifyLargeExpense(userId: string, amount: number, assetName: string) {
    return sendNotificationToUser({
        userId,
        title: `💰 Gasto importante registrado`,
        body: `Se registró un gasto de $${amount.toLocaleString()} en ${assetName}`,
        url: '/app/finanzas',
        tag: 'large-expense',
    });
}

export async function notifyLargeIncome(userId: string, amount: number, assetName: string) {
    return sendNotificationToUser({
        userId,
        title: `💵 Ingreso registrado`,
        body: `Se registró un ingreso de $${amount.toLocaleString()} en ${assetName}`,
        url: '/app/finanzas',
        tag: 'large-income',
    });
}

export async function notifyAssetCreated(userId: string, assetName: string) {
    return sendNotificationToUser({
        userId,
        title: `🚗 Nuevo activo agregado`,
        body: `${assetName} ha sido agregado exitosamente`,
        url: '/app/activos',
        tag: 'asset-created',
    });
}
