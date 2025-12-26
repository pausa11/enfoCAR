import { useState, useEffect, useCallback } from 'react';

export type NotificationPermission = 'default' | 'granted' | 'denied';

interface UsePushNotificationsReturn {
    permission: NotificationPermission;
    isSupported: boolean;
    isSubscribed: boolean;
    isLoading: boolean;
    error: string | null;
    requestPermission: () => Promise<boolean>;
    subscribe: () => Promise<boolean>;
    unsubscribe: () => Promise<boolean>;
}

/**
 * Hook to manage push notification permissions and subscriptions
 */
export function usePushNotifications(): UsePushNotificationsReturn {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check if push notifications are supported
    useEffect(() => {
        const supported =
            'serviceWorker' in navigator &&
            'PushManager' in window &&
            'Notification' in window;

        setIsSupported(supported);

        if (supported) {
            setPermission(Notification.permission as NotificationPermission);
            checkSubscription();
        }
    }, []);

    // Check if user is already subscribed
    const checkSubscription = useCallback(async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
        } catch (err) {
            console.error('Error checking subscription:', err);
        }
    }, []);

    // Request notification permission
    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!isSupported) {
            setError('Push notifications are not supported in this browser');
            return false;
        }

        try {
            setIsLoading(true);
            setError(null);

            const result = await Notification.requestPermission();
            setPermission(result as NotificationPermission);

            if (result === 'granted') {
                return true;
            } else {
                setError('Notification permission denied');
                return false;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to request permission';
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isSupported]);

    // Subscribe to push notifications
    const subscribe = useCallback(async (): Promise<boolean> => {
        if (!isSupported) {
            setError('Push notifications are not supported in this browser');
            return false;
        }

        if (permission !== 'granted') {
            const granted = await requestPermission();
            if (!granted) return false;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Get VAPID public key from server
            const keyResponse = await fetch('/api/push/vapid-public-key');
            if (!keyResponse.ok) {
                throw new Error('Failed to get VAPID public key');
            }
            const { publicKey } = await keyResponse.json();

            // Subscribe to push notifications
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey),
            });

            // Send subscription to server
            const response = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    endpoint: subscription.endpoint,
                    keys: {
                        p256dh: arrayBufferToBase64(subscription.getKey('p256dh') as ArrayBuffer),
                        auth: arrayBufferToBase64(subscription.getKey('auth') as ArrayBuffer),
                    },
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save subscription');
            }

            setIsSubscribed(true);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe';
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isSupported, permission, requestPermission]);

    // Unsubscribe from push notifications
    const unsubscribe = useCallback(async (): Promise<boolean> => {
        if (!isSupported) {
            setError('Push notifications are not supported in this browser');
            return false;
        }

        try {
            setIsLoading(true);
            setError(null);

            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                // Unsubscribe from push manager
                await subscription.unsubscribe();

                // Remove subscription from server
                await fetch('/api/push/unsubscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        endpoint: subscription.endpoint,
                    }),
                });
            }

            setIsSubscribed(false);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to unsubscribe';
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isSupported]);

    return {
        permission,
        isSupported,
        isSubscribed,
        isLoading,
        error,
        requestPermission,
        subscribe,
        unsubscribe,
    };
}

// Helper functions
function urlBase64ToUint8Array(base64String: string): BufferSource {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
