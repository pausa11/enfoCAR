# Push Notifications - Setup Guide

## Generación de Claves VAPID

Antes de usar las notificaciones push, necesitas generar claves VAPID:

```bash
node scripts/generate-vapid-keys.js
```

Copia las claves generadas y agrégalas a tu archivo `.env`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=tu_clave_publica_aqui
VAPID_PRIVATE_KEY=tu_clave_privada_aqui
VAPID_SUBJECT=mailto:tu-email@ejemplo.com
```

⚠️ **IMPORTANTE**: Nunca compartas ni subas la clave privada a control de versiones.

## Uso

### Activar Notificaciones

Los usuarios pueden activar las notificaciones desde:
1. El botón en el sidebar (menú lateral)
2. La página de configuración (cuando esté implementada)

### Enviar Notificaciones

Usa las funciones helper en `lib/push/notification-triggers.ts`:

```typescript
import { notifyDocumentExpiring } from '@/lib/push/notification-triggers';

// Notificar documento próximo a vencer
await notifyDocumentExpiring(
  userId,
  'SOAT',
  'Toyota Corolla',
  7 // días hasta vencimiento
);
```

### Notificaciones Disponibles

- `notifyDocumentExpiring` - Documentos próximos a vencer
- `notifyMaintenanceDue` - Mantenimientos programados
- `notifyLargeExpense` - Gastos importantes
- `notifyLargeIncome` - Ingresos importantes
- `notifyAssetCreated` - Nuevo activo creado

## Testing

Para probar las notificaciones:

1. Activa las notificaciones desde el sidebar
2. Usa el botón "Enviar notificación de prueba" en la configuración
3. O envía una notificación manualmente:

```bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "tu-user-id",
    "notification": {
      "title": "Prueba",
      "body": "Esta es una notificación de prueba"
    }
  }'
```

## Compatibilidad

- ✅ Chrome (desktop y móvil)
- ✅ Firefox
- ✅ Edge
- ⚠️ Safari (soporte limitado, requiere iOS 16.4+)

## Troubleshooting

### Las notificaciones no aparecen

1. Verifica que las claves VAPID estén configuradas correctamente
2. Asegúrate de que el usuario haya otorgado permisos
3. Revisa la consola del navegador para errores
4. Verifica que el service worker esté registrado correctamente

### Error "VAPID keys not configured"

Ejecuta el script de generación de claves y agrégalas al archivo `.env`.

### Las notificaciones no se muestran en producción

Asegúrate de que:
- El sitio esté servido sobre HTTPS
- Las variables de entorno estén configuradas en tu plataforma de hosting
- El service worker esté correctamente desplegado
