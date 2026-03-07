-- Configuración de Storage para Supabase
-- NOTA: El bucket "perfumes" ya existe en tu proyecto de Supabase
-- Si necesitas crear un nuevo bucket, ve a: Storage > New bucket

-- Bucket actual en uso: "perfumes"
-- Este bucket se usa para almacenar:
-- - Logos de empresa (en carpeta company/)
-- - Imágenes de productos (en carpetas products/main, products/additional, etc.)

-- Si necesitas crear el bucket programáticamente, usa la API de Supabase Storage
-- o créalo manualmente desde el Dashboard de Supabase

-- Verificar que el bucket existe:
-- Ve a: https://app.supabase.com/project/vqkshcozrnqfbxreuczj/storage/buckets
-- Si no existe, créalo con estos parámetros:
-- - Name: products
-- - Public bucket: ON (para permitir acceso público a las imágenes)
-- - File size limit: 5MB (o el límite que prefieras)
-- - Allowed MIME types: image/*

-- Políticas de Storage (se configuran desde Storage > Policies en el Dashboard)
-- O usando la API de Supabase Storage

-- Política para lectura pública (todos pueden leer)
-- Esto se configura desde Storage > Policies > New Policy
-- Policy name: Public read access
-- Allowed operation: SELECT
-- Target roles: anon, authenticated
-- USING expression: true

-- Política para escritura (solo usuarios autenticados)
-- Policy name: Authenticated write access
-- Allowed operation: INSERT, UPDATE
-- Target roles: authenticated
-- USING expression: auth.role() = 'authenticated'
-- WITH CHECK expression: auth.role() = 'authenticated'
