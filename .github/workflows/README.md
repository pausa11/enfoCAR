# GitHub Actions Workflows

Este directorio contiene los workflows de GitHub Actions que reemplazan los crons de Vercel.

## 📅 Crons Configurados

| Workflow | Horario (UTC-5) | Horario (UTC) | Descripción |
|----------|-----------------|---------------|-------------|
| `cron-check-documents.yml` | 9:00 AM | 14:00 | Revisa documentos próximos a vencer |
| `cron-daily-reminder-evening.yml` | 6:00 PM | 23:00 | Recordatorio de tarde |
| `cron-daily-reminder-night.yml` | 9:00 PM | 02:00 | Recordatorio de noche |

## ⚙️ Configuración Requerida

Antes de que los workflows funcionen, debes configurar estos **GitHub Secrets**:

1. `APP_URL` - URL de tu aplicación en producción (ej: `https://tu-app.vercel.app`)
2. `CRON_SECRET` - Secret para autenticar los crons (debe coincidir con el de Vercel)

### Cómo agregar secrets:

1. Ve a **Settings** → **Secrets and variables** → **Actions**
2. Click en **New repository secret**
3. Agrega `APP_URL` y `CRON_SECRET`

## 🧪 Testing

Para probar manualmente un workflow:

1. Ve a **Actions** en GitHub
2. Selecciona el workflow
3. Click en **Run workflow**

## 📝 Notas

- Los horarios están configurados para **UTC-5** (Colombia/Bogotá)
- Si estás en otra zona horaria, ajusta los cron expressions
- GitHub Actions puede tener un delay de hasta 15 minutos en la ejecución programada
