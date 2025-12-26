# Document Expiry Notifications - Quick Guide

## ✅ Implementado

Se ha creado un sistema automático de notificaciones push para documentos próximos a vencer.

## 🔔 Cómo funciona

### Automático (Cron Job)
- Se ejecuta **diariamente a las 9 AM**
- Revisa todos los documentos activos
- Envía notificaciones en estos intervalos:
  - **30 días** antes del vencimiento
  - **15 días** antes
  - **7 días** antes ⚠️
  - **3 días** antes 🚨
  - **1 día** antes 🚨

### Manual (Botón de prueba)
- Botón "Verificar documentos por vencer" en `/app/documentos`
- Revisa tus documentos inmediatamente
- Envía notificaciones si hay documentos próximos a vencer

## 📋 Archivos creados

1. **`/api/cron/check-expiring-documents`** - Cron job automático
2. **`/api/documents/check-expiry-now`** - Endpoint manual
3. **`CheckExpiringDocumentsButton`** - Botón de prueba
4. **`vercel.json`** - Configuración del cron

## 🧪 Cómo probar

1. Asegúrate de tener notificaciones activas (botón en sidebar)
2. Ve a `/app/documentos`
3. Haz clic en "Verificar documentos por vencer"
4. Si tienes documentos que vencen en los próximos 30 días, recibirás notificaciones

## ⚙️ Configuración

El cron job está configurado en `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/check-expiring-documents",
    "schedule": "0 9 * * *"  // Diario a las 9 AM
  }]
}
```

Para cambiar la hora, modifica el schedule (formato cron).
