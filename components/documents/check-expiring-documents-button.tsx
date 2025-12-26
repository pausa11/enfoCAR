'use client';

import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useState } from 'react';

export function CheckExpiringDocumentsButton() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleCheck = async () => {
        setIsLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/documents/check-expiry-now', {
                method: 'POST',
            });

            const data = await response.json();

            if (data.success) {
                if (data.documentsChecked === 0) {
                    setMessage('✅ No hay documentos próximos a vencer');
                } else {
                    setMessage(`✅ Se enviaron ${data.notificationsSent} notificación(es) para ${data.documentsChecked} documento(s)`);
                }
            } else {
                setMessage(`❌ ${data.error || 'Error al verificar documentos'}`);
            }
        } catch (error) {
            setMessage('❌ Error al verificar documentos');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <Button
                onClick={handleCheck}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="gap-2"
            >
                <Bell className="h-4 w-4" />
                {isLoading ? 'Verificando...' : 'Verificar documentos por vencer'}
            </Button>
            {message && (
                <p className="text-sm text-muted-foreground">{message}</p>
            )}
        </div>
    );
}
