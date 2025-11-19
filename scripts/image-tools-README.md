# Herramientas de Gestión de Imágenes

Este directorio contiene scripts para ayudarte a gestionar las imágenes de tu tienda, convertirlas a formato WebP y actualizar las URLs en la base de datos de Firebase.

## Herramientas Disponibles

### 1. Interfaz Gráfica en la Aplicación

La forma más sencilla de actualizar las URLs es usar la interfaz gráfica integrada en la aplicación:

1. Inicia sesión como administrador
2. Ve a "Herramientas" → "Actualizar URLs" en el panel lateral
3. Sigue las instrucciones en pantalla

Esta interfaz te permite:
- Verificar si las imágenes existen antes de actualizar las URLs
- Cambiar la extensión de las imágenes (por ejemplo, de .jpg a .webp)
- Simular los cambios antes de aplicarlos realmente
- Ver un informe detallado del proceso

### 2. Scripts para Línea de Comandos

Si prefieres usar la línea de comandos o necesitas procesar muchas imágenes en lote, puedes usar estos scripts:

#### Extraer URLs de Imágenes de Firebase

```bash
# Instalar dependencias
npm install firebase-admin

# Configurar credenciales
# 1. Crea un archivo firebase-credentials.json con las credenciales de tu cuenta de servicio
# 2. Colócalo en la raíz del proyecto

# Ejecutar el script
node scripts/extract-image-urls.js
```

Este script generará dos archivos:
- `image_urls.txt` - Lista simple de todas las URLs de imágenes
- `image_urls_details.json` - Información detallada sobre cada URL (colección, documento, campo)

#### Verificar y Convertir Imágenes a WebP

```bash
# Instalar dependencias
npm install sharp node-fetch

# Ejecutar el script
node scripts/verify-and-convert-webp.js image_urls.txt
```

Este script:
1. Lee la lista de URLs del archivo proporcionado
2. Verifica si cada imagen existe
3. Descarga la imagen
4. La convierte a formato WebP
5. Guarda la imagen convertida en ./imagenes_webp/
6. Genera registros de éxitos y errores

## Recomendaciones

1. **Copia de Seguridad**: SIEMPRE haz una copia de seguridad de tu base de datos Firebase antes de actualizar las URLs.

2. **Proceso Recomendado**:
   - Primero extrae todas las URLs con `extract-image-urls.js`
   - Luego convierte las imágenes con `verify-and-convert-webp.js`
   - Sube las imágenes convertidas a tu servidor
   - Finalmente usa la interfaz gráfica para actualizar las URLs en la base de datos

3. **Verificación**: Usa la opción "Verificar existencia de imágenes" en la interfaz gráfica para asegurarte de que solo se actualicen las URLs de imágenes que realmente existen en tu servidor.

## Solución de Problemas

- **Error al cargar credenciales**: Asegúrate de tener un archivo `firebase-credentials.json` válido en la raíz del proyecto.

- **Imágenes no encontradas**: Verifica que las URLs en tu base de datos sean accesibles públicamente.

- **Error al convertir**: Asegúrate de tener suficiente espacio en disco y permisos de escritura en el directorio de salida.

- **Cambios no reflejados**: Después de actualizar las URLs, es posible que necesites limpiar la caché del navegador para ver los cambios.
