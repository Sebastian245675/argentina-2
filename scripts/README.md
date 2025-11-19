# Herramientas de Migración de Imágenes

Este directorio contiene herramientas para ayudarte a migrar las imágenes de Cloudinary a tu servidor Hostinger.

## Herramientas Disponibles

### 1. Interfaz Web para Actualizar URLs (Recomendada)

La forma más sencilla de actualizar las URLs de tus imágenes es usar la interfaz web integrada en tu aplicación.

**Para acceder:**
1. Inicia sesión con una cuenta de administrador
2. Navega a `/admin/update-image-urls`
3. Sigue las instrucciones en la pantalla

Esta herramienta te permite:
- Ver cuántos documentos serán afectados
- Ejecutar primero en modo simulación para verificar los cambios
- Ver un resumen de las actualizaciones
- Actualizar todas las URLs con un solo clic

### 2. Script de Node.js (Para Actualización Masiva)

Si prefieres un enfoque programático para actualizar grandes cantidades de datos, puedes utilizar el script Node.js incluido.

**Requisitos previos:**
- Node.js instalado
- firebase-admin instalado (`npm install firebase-admin`)
- Un archivo `serviceAccountKey.json` con tus credenciales de Firebase Admin

**Pasos para usar el script:**
1. Coloca tu archivo `serviceAccountKey.json` en la misma carpeta que el script
2. Abre una terminal y navega hasta la carpeta del script
3. Ejecuta: `node update-image-urls.js`
4. Espera a que termine el proceso
5. Revisa el reporte generado

## Cómo Funciona

Ambas herramientas buscan en tu base de datos Firestore cualquier URL que contenga "cloudinary.com", extraen el nombre del archivo original y crean una nueva URL con tu servidor Hostinger como base.

- URL base nueva: `https://regalaalgosrl.com/imagenes/`

Por ejemplo, una URL como:
```
https://res.cloudinary.com/djyrschvm/image/upload/v1754395448/products/calcetines-alpaca.jpg
```

O incluso de otra cuenta de Cloudinary como:
```
https://res.cloudinary.com/otra-cuenta/image/upload/v1234567890/calcetines-alpaca.jpg
```

Se convertirán en:
```
https://regalaalgosrl.com/imagenes/calcetines-alpaca.jpg
```

La herramienta conserva el nombre de archivo original independientemente de la cuenta de Cloudinary o la estructura de la URL.

## Recomendaciones de Seguridad

1. **Siempre haz una copia de seguridad** de tu base de datos antes de ejecutar actualizaciones masivas
2. Prueba primero con el modo de simulación para verificar los cambios
3. Verifica algunas imágenes manualmente después de la actualización para confirmar que funcionan correctamente

## Solución de Problemas

Si encuentras algún problema:

1. Verifica que las imágenes existan en tu servidor Hostinger con la misma ruta relativa
2. Confirma que tienes permisos de escritura en Firestore
3. Revisa los reportes de errores generados por las herramientas
