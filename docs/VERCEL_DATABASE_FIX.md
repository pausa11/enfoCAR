# Solución al Error de DATABASE_URL en Vercel

## El Problema

Prisma necesita acceso a `DATABASE_URL` durante el **build time** en Vercel, no solo en runtime.

## Solución Paso a Paso

### 1. Verificar Variables de Entorno en Vercel

Ve a **Vercel Dashboard** → **Tu Proyecto** → **Settings** → **Environment Variables**

Para **CADA** una de estas variables, asegúrate de que estén marcadas para **TODOS** los ambientes:

#### `DATABASE_URL`
- ✅ Production
- ✅ Preview  
- ✅ Development

#### `DIRECT_URL`
- ✅ Production
- ✅ Preview
- ✅ Development

#### `NEXT_PUBLIC_SUPABASE_URL`
- ✅ Production
- ✅ Preview
- ✅ Development

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY` (o `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
- ✅ Production
- ✅ Preview
- ✅ Development

### 2. Verificar que las URLs sean correctas

Haz clic en el ícono del ojo 👁️ para ver cada variable:

**`DATABASE_URL`** debe verse así:
```
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**`DIRECT_URL`** debe verse así:
```
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

### 3. Hacer Push de los Cambios

Los cambios que hice en el código necesitan ser deployados:

```bash
git add .
git commit -m "Fix Prisma initialization for Vercel"
git push
```

Esto automáticamente triggereará un nuevo deployment en Vercel.

### 4. Verificar el Build Log

Después del push:
1. Ve a **Vercel Dashboard** → **Deployments**
2. Haz clic en el deployment que está en progreso
3. Ve a la pestaña **Building**
4. Busca errores relacionados con Prisma o DATABASE_URL

### 5. Si Sigue Fallando

Si después de todo esto sigue el error, el problema puede ser que Vercel no está exponiendo las variables durante el build. En ese caso:

1. Ve a **Settings** → **Environment Variables**
2. **Elimina** `DATABASE_URL` y `DIRECT_URL`
3. **Agrégalas de nuevo** asegurándote de marcar **todas las checkboxes** (Production, Preview, Development)
4. Haz un **Redeploy**

## Cambios Realizados en el Código

1. **`lib/prisma.ts`**: Ahora pasa explícitamente `DATABASE_URL` al cliente de Prisma
2. **`package.json`**: Agregado script `postinstall` para generar el cliente de Prisma automáticamente

## Verificación

Después del deployment exitoso:
1. Ve a tu URL de producción
2. Intenta autenticarte con Google
3. Deberías ver el dashboard sin errores
