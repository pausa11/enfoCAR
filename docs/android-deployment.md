# Publicar enfoCAR en Google Play Store

Esta guía te ayudará a publicar enfoCAR como una PWA en Google Play Store usando Trusted Web Activity (TWA).

## Requisitos Previos

1. **Dominio con HTTPS**: Tu PWA debe estar desplegada en un dominio con certificado SSL válido
2. **Cuenta de Google Play Developer**: Cuesta $25 USD (pago único)
3. **Android Studio** o **Bubblewrap CLI** instalado
4. **Java JDK 11+** instalado

## Opción 1: Usar Bubblewrap CLI (Recomendado)

Bubblewrap es una herramienta de línea de comandos de Google para crear TWAs fácilmente.

### 1. Instalar Bubblewrap

```bash
npm install -g @bubblewrap/cli
```

### 2. Inicializar el proyecto TWA

```bash
# Crear una carpeta para el proyecto Android
mkdir enfocar-android
cd enfocar-android

# Inicializar Bubblewrap (reemplaza con tu dominio real)
bubblewrap init --manifest https://tudominio.com/manifest.json
```

Bubblewrap te hará varias preguntas:
- **Domain**: Tu dominio (ej: `tudominio.com`)
- **Package name**: `com.enfocar.twa` (o el que prefieras)
- **App name**: `enfoCAR`
- **Start URL**: `/`
- **Theme color**: `#4A90E2`
- **Background color**: `#4A90E2`
- **Icon URL**: URL completa de tu icono

### 3. Generar el keystore (primera vez)

```bash
# Bubblewrap te preguntará si quieres crear un keystore
# Responde "yes" y guarda la contraseña en un lugar seguro
```

**⚠️ IMPORTANTE**: Guarda el archivo `.keystore` y la contraseña en un lugar seguro. Si los pierdes, no podrás actualizar tu app en el futuro.

### 4. Obtener el SHA-256 fingerprint

```bash
# Listar el fingerprint de tu keystore
keytool -list -v -keystore android.keystore -alias android

# Busca la línea que dice "SHA256:" y copia el valor
```

### 5. Actualizar assetlinks.json

Edita el archivo `/public/.well-known/assetlinks.json` en tu proyecto y reemplaza `REPLACE_WITH_YOUR_SHA256_FINGERPRINT` con el SHA-256 que obtuviste.

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.enfocar.twa",
      "sha256_cert_fingerprints": [
        "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
      ]
    }
  }
]
```

**⚠️ IMPORTANTE**: Despliega este archivo en tu servidor en la ruta `https://tudominio.com/.well-known/assetlinks.json`

### 6. Construir el APK/Bundle

```bash
# Para testing (APK)
bubblewrap build

# Para producción (Android App Bundle - recomendado)
bubblewrap build --release
```

El archivo generado estará en `./app/build/outputs/`

### 7. Probar localmente

```bash
# Instalar en un dispositivo Android conectado
adb install app/build/outputs/apk/release/app-release-signed.apk
```

### 8. Subir a Google Play Console

1. Ve a [Google Play Console](https://play.google.com/console)
2. Crea una nueva aplicación
3. Completa la información requerida:
   - Nombre de la app: **enfoCAR**
   - Descripción corta y larga
   - Capturas de pantalla (mínimo 2)
   - Icono de la app (512x512)
   - Gráfico destacado (1024x500)
   - Categoría: **Productividad** o **Negocios**
   - Política de privacidad (URL)
4. En "Versiones" → "Producción" → "Crear nueva versión"
5. Sube el archivo `.aab` (Android App Bundle)
6. Completa el formulario de contenido
7. Envía para revisión

## Opción 2: Usar Android Studio

Si prefieres usar Android Studio:

1. Descarga [Android Studio](https://developer.android.com/studio)
2. Sigue la [guía oficial de TWA](https://developer.chrome.com/docs/android/trusted-web-activity/integration-guide/)
3. Usa los mismos valores que en la opción de Bubblewrap

## Verificación de Digital Asset Links

Después de desplegar `assetlinks.json`, verifica que funcione:

```bash
# Reemplaza con tu dominio
curl https://tudominio.com/.well-known/assetlinks.json
```

También puedes usar la herramienta de Google:
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://tudominio.com&relation=delegate_permission/common.handle_all_urls

## Actualizaciones Futuras

Para actualizar la app:

```bash
cd enfocar-android

# Incrementar la versión en twa-manifest.json
# Luego construir de nuevo
bubblewrap build --release

# Subir el nuevo .aab a Google Play Console
```

## Troubleshooting

### Error: "Digital Asset Links verification failed"

- Verifica que `assetlinks.json` esté accesible en `https://tudominio.com/.well-known/assetlinks.json`
- Verifica que el SHA-256 fingerprint sea correcto
- Verifica que el package name coincida

### Error: "App not opening, showing Chrome UI"

- Verifica que el dominio en el manifest coincida con el dominio de la TWA
- Verifica que Digital Asset Links esté configurado correctamente
- Espera unos minutos, a veces tarda en propagarse

### Error al firmar el APK

- Verifica que tengas Java JDK 11+ instalado
- Verifica que el keystore no esté corrupto
- Verifica que la contraseña sea correcta

## Recursos Adicionales

- [Documentación oficial de TWA](https://developer.chrome.com/docs/android/trusted-web-activity/)
- [Bubblewrap GitHub](https://github.com/GoogleChromeLabs/bubblewrap)
- [Google Play Console](https://play.google.com/console)
- [Digital Asset Links Tester](https://developers.google.com/digital-asset-links/tools/generator)

## Checklist Pre-Publicación

- [ ] PWA desplegada en dominio con HTTPS
- [ ] Manifest.json accesible
- [ ] Iconos de 512x512 y 192x192 disponibles
- [ ] Service worker funcionando
- [ ] assetlinks.json desplegado y accesible
- [ ] SHA-256 fingerprint correcto en assetlinks.json
- [ ] TWA construida y probada localmente
- [ ] Capturas de pantalla preparadas (mínimo 2)
- [ ] Descripción de la app escrita
- [ ] Política de privacidad disponible (URL)
- [ ] Cuenta de Google Play Developer activa

¡Buena suerte con la publicación! 🚀
