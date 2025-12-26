'use client';

import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/lib/hooks/use-push-notifications';
import { useEffect, useState } from 'react';

export function NotificationPermissionButton() {
    const {
        permission,
        isSupported,
        isSubscribed,
        isLoading,
        error,
        subscribe,
        unsubscribe,
    } = usePushNotifications();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isSupported) {
        return null;
    }

    const handleToggle = async () => {
        if (isSubscribed) {
            await unsubscribe();
        } else {
            await subscribe();
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <Button
                onClick={handleToggle}
                disabled={isLoading || permission === 'denied'}
                variant={isSubscribed ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
            >
                {isSubscribed ? (
                    <>
                        <Bell className="h-4 w-4" />
                        Notificaciones activas
                    </>
                ) : (
                    <>
                        <BellOff className="h-4 w-4" />
                        Activar notificaciones
                    </>
                )}
            </Button>

            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}

            {permission === 'denied' && (
                <p className="text-xs text-muted-foreground">
                    Las notificaciones están bloqueadas. Por favor, habilítalas en la configuración de tu navegador.
                </p>
            )}
        </div>
    );
}
