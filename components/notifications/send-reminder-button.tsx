'use client';

import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useState } from 'react';

export function SendReminderButton() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSend = async () => {
        setIsLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/reminders/send-now', {
                method: 'POST',
            });

            const data = await response.json();

            if (data.success) {
                setMessage(`✅ Recordatorio enviado exitosamente`);
            } else {
                setMessage(`❌ ${data.error || 'Error al enviar recordatorio'}`);
            }
        } catch (error) {
            setMessage('❌ Error al enviar recordatorio');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <Button
                onClick={handleSend}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="gap-2"
            >
                <Bell className="h-4 w-4" />
                {isLoading ? 'Enviando...' : 'Probar recordatorio diario'}
            </Button>
            {message && (
                <p className="text-sm text-muted-foreground">{message}</p>
            )}
        </div>
    );
}
