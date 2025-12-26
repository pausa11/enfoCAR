import webPush from 'web-push';
import { vapidKeys, validateVapidKeys } from './vapid';

// Configure web-push with VAPID keys
if (validateVapidKeys()) {
    webPush.setVapidDetails(
        vapidKeys.subject,
        vapidKeys.publicKey,
        vapidKeys.privateKey
    );
}

export interface PushSubscription {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

export interface NotificationPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: any;
    tag?: string;
    requireInteraction?: boolean;
    actions?: Array<{
        action: string;
        title: string;
        icon?: string;
    }>;
}

/**
 * Send a push notification to a subscriber
 */
export async function sendPushNotification(
    subscription: PushSubscription,
    payload: NotificationPayload
): Promise<{ success: boolean; error?: string }> {
    try {
        if (!validateVapidKeys()) {
            throw new Error('VAPID keys are not configured');
        }

        const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            },
        };

        await webPush.sendNotification(
            pushSubscription,
            JSON.stringify(payload)
        );

        return { success: true };
    } catch (error: any) {
        console.error('Error sending push notification:', error);

        // Handle expired subscriptions
        if (error.statusCode === 410) {
            return {
                success: false,
                error: 'subscription_expired'
            };
        }

        return {
            success: false,
            error: error.message || 'Unknown error'
        };
    }
}

/**
 * Send push notifications to multiple subscribers
 */
export async function sendPushNotificationBatch(
    subscriptions: PushSubscription[],
    payload: NotificationPayload
): Promise<{
    successful: number;
    failed: number;
    expired: string[];
}> {
    const results = await Promise.allSettled(
        subscriptions.map(sub => sendPushNotification(sub, payload))
    );

    const expired: string[] = [];
    let successful = 0;
    let failed = 0;

    results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
            successful++;
        } else {
            failed++;
            if (result.status === 'fulfilled' && result.value.error === 'subscription_expired') {
                expired.push(subscriptions[index].endpoint);
            }
        }
    });

    return { successful, failed, expired };
}
