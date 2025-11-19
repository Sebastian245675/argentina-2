# 🔧 SOLUCIÓN DEFINITIVA - Error CORS Firebase Storage

## ❌ Error actual:
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' has been blocked by CORS policy
```

## ✅ SOLUCIÓN RÁPIDA (Método 1 - Recomendado)

### Paso 1: Instalar Google Cloud SDK

**Windows:**
1. Descarga: https://cloud.google.com/sdk/docs/install#windows
2. Ejecuta el instalador
3. Reinicia tu terminal

**Mac/Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### Paso 2: Iniciar sesión
```bash
gcloud auth login
```

### Paso 3: Configurar proyecto
```bash
gcloud config set project tienda-arg
```

### Paso 4: Aplicar CORS (DESDE LA CARPETA DEL PROYECTO)
```bash
gsutil cors set cors.json gs://tienda-arg.appspot.com
```

### Paso 5: Verificar
```bash
gsutil cors get gs://tienda-arg.appspot.com
```

---

## ✅ SOLUCIÓN ALTERNATIVA (Método 2 - Sin instalar nada)

### Usar Firebase Console directamente:

1. Ve a: https://console.cloud.google.com/storage/browser/tienda-arg.appspot.com
2. Haz clic en los **3 puntos verticales** al lado del bucket
3. Selecciona **"Edit CORS configuration"**
4. Pega esto:

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization"]
  }
]
```

5. Guarda
6. **Espera 2-3 minutos** para que se propague
7. Recarga tu aplicación

---

## ✅ SOLUCIÓN DEFINITIVA (Método 3 - Si nada funciona)

Si los métodos anteriores no funcionan, el problema puede ser que el bucket nuevo tiene un nombre diferente.

### Actualizar la configuración de Firebase:

1. Ve a tu Firebase Console
2. Storage → Verifica el nombre del bucket
3. Si dice `tienda-arg.firebasestorage.app`, actualiza el archivo `src/firebase.ts`:

Cambia:
```typescript
storageBucket: "tienda-arg.appspot.com"
```

Por:
```typescript
storageBucket: "tienda-arg.firebasestorage.app"
```

4. Aplica CORS al bucket correcto:
```bash
gsutil cors set cors.json gs://tienda-arg.firebasestorage.app
```

---

## 🎯 ¿Cuál método usar?

- **¿Tienes 5 minutos?** → Método 1 (más permanente)
- **¿Quieres algo rápido?** → Método 2 (desde el navegador)
- **¿Nada funciona?** → Método 3 (verificar bucket)

---

## ⚡ Solución INMEDIATA mientras tanto

Si necesitas seguir trabajando AHORA, puedes:

1. Usar URLs de imágenes externas (Imgur, Cloudinary, etc.)
2. O esperar a que se propague el CORS (2-5 minutos)

---

## ✅ Verificación

Una vez aplicado, deberías ver:
- ✅ La imagen se sube sin errores
- ✅ Aparece la barra de progreso
- ✅ Se muestra la preview
- ✅ No hay errores CORS en consola

**Después de aplicar CORS, recarga la página con Ctrl + Shift + R (hard refresh)**

