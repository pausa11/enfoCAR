'use client';

import { Bell, BellOff, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePushNotifications } from '@/lib/hooks/use-push-notifications';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SendReminderButton } from '@/components/notifications/send-reminder-button';

export function NotificationSettings() {
    const {
        permission,
        isSupported,
        isSubscribed,
        isLoading,
        subscribe,
        unsubscribe,
    } = usePushNotifications();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    if (!isSupported) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BellOff className="h-5 w-5" />
                        Notificaciones Push
                    </CardTitle>
                    <CardDescription>
                        Tu navegador no soporta notificaciones push
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const handleToggle = async (checked: boolean) => {
        if (checked) {
            await subscribe();
        } else {
            await unsubscribe();
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notificaciones Push
                </CardTitle>
                <CardDescription>
                    Recibe notificaciones sobre eventos importantes de tus activos
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Main toggle */}
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="push-notifications">
                            Habilitar notificaciones
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            {permission === 'granted'
                                ? 'Recibirás notificaciones en este dispositivo'
                                : permission === 'denied'
                                    ? 'Las notificaciones están bloqueadas'
                                    : 'Solicitar permiso para enviar notificaciones'
                            }
                        </p>
                    </div>
                    <Switch
                        id="push-notifications"
                        checked={isSubscribed}
                        onCheckedChange={handleToggle}
                        disabled={isLoading || permission === 'denied'}
                    />
                </div>

                {permission === 'denied' && (
                    <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 p-4">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            Las notificaciones están bloqueadas en tu navegador. Para habilitarlas:
                        </p>
                        <ol className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 list-decimal list-inside space-y-1">
                            <li>Haz clic en el ícono de candado en la barra de direcciones</li>
                            <li>Busca la opción de "Notificaciones"</li>
                            <li>Cambia el permiso a "Permitir"</li>
                            <li>Recarga la página</li>
                        </ol>
                    </div>
                )}

                {isSubscribed && (
                    <div className="space-y-4 pt-4 border-t">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Tipos de notificaciones
                        </h4>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="notify-maintenance">
                                        Mantenimientos
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Recordatorios de mantenimientos próximos
                                    </p>
                                </div>
                                <Switch
                                    id="notify-maintenance"
                                    defaultChecked={true}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="notify-documents">
                                        Documentos
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Vencimientos de SOAT, tecnomecánica, etc.
                                    </p>
                                </div>
                                <Switch
                                    id="notify-documents"
                                    defaultChecked={true}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="notify-finance">
                                        Finanzas
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Alertas sobre ingresos y gastos importantes
                                    </p>
                                </div>
                                <Switch
                                    id="notify-finance"
                                    defaultChecked={true}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="notify-reminders">
                                        Recordatorios diarios
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Recordatorios a las 6 PM y 9 PM para registrar movimientos
                                    </p>
                                </div>
                                <Switch
                                    id="notify-reminders"
                                    defaultChecked={true}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <SendReminderButton />

                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={async () => {
                                    // Send test notification
                                    const response = await fetch('/api/push/send', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            userId: 'current', // This would be replaced with actual user ID
                                            notification: {
                                                title: '🔔 Notificación de prueba',
                                                body: 'Si ves esto, ¡las notificaciones funcionan correctamente!',
                                                icon: '/icons/icon-192.png',
                                                data: { url: '/' },
                                            },
                                        }),
                                    });

                                    if (response.ok) {
                                        console.log('Test notification sent');
                                    }
                                }}
                            >
                                Enviar notificación de prueba
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
