# Daily Financial Reminders

## 📅 Recordatorios Automáticos

Se envían notificaciones push automáticas para recordar a los usuarios registrar sus movimientos financieros:

### Horarios

- **6:00 PM** - Primer recordatorio del día
- **9:00 PM** - Último recordatorio del día

### Mensajes

**6 PM:**
- 💰 **Título**: "¡Hora de registrar tus movimientos!"
- **Mensaje**: "No olvides registrar tus gastos e ingresos de hoy. Los datos valen oro 💎"

**9 PM:**
- 📊 **Título**: "Último recordatorio del día"
- **Mensaje**: "¿Ya registraste todos tus movimientos de hoy? Mantén tu control financiero al día 🎯"

## 🎯 Objetivo

Motivar a los usuarios a:
- Registrar sus movimientos financieros diariamente
- Mantener un control actualizado de sus gastos e ingresos
- Crear el hábito de tracking financiero

## 🔧 Implementación

### Archivos Creados

1. **`/api/cron/daily-reminder/route.ts`** - Endpoint del cron job
2. **`/api/reminders/send-now/route.ts`** - Endpoint para pruebas manuales
3. **`components/notifications/send-reminder-button.tsx`** - Botón de prueba
4. **`vercel.json`** - Configuración de cron jobs

### Configuración Cron

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-reminder",
      "schedule": "0 18 * * *"  // 6 PM
    },
    {
      "path": "/api/cron/daily-reminder",
      "schedule": "0 21 * * *"  // 9 PM
    }
  ]
}
```

## 🧪 Pruebas

### Botón de Prueba

En la configuración de notificaciones, hay un botón "Probar recordatorio diario" que:
- Envía un recordatorio inmediatamente
- Usa el mensaje apropiado según la hora actual
- Permite verificar que las notificaciones funcionan

### Verificación Manual

```bash
# Enviar recordatorio de prueba
curl -X POST http://localhost:3000/api/reminders/send-now
```

## 📊 Comportamiento

- **Envío masivo**: Se envía a todos los usuarios con notificaciones activas
- **Limpieza automática**: Elimina suscripciones expiradas
- **No requiere interacción**: Las notificaciones se cierran automáticamente
- **Navegación**: Al hacer clic, redirige a `/app/finanzas`

## 🎨 Personalización

Para cambiar los mensajes, edita `/api/cron/daily-reminder/route.ts`:

```typescript
// Mensaje de 6 PM
emoji = '💰';
reminderTitle = '¡Hora de registrar tus movimientos!';
reminderMessage = 'Tu mensaje personalizado aquí';

// Mensaje de 9 PM
emoji = '📊';
reminderTitle = 'Último recordatorio del día';
reminderMessage = 'Tu mensaje personalizado aquí';
```

## 🚀 Producción

Los recordatorios se activarán automáticamente al desplegar a Vercel. No requiere configuración adicional.
