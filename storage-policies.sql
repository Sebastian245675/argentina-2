-- Políticas de Storage para Supabase
-- Ejecuta este script en el SQL Editor de Supabase
-- IMPORTANTE: Estas políticas permiten que usuarios autenticados suban archivos al bucket "perfumes"

-- Primero eliminar políticas existentes si las hay (para evitar errores de duplicados)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- Política 1: Permitir lectura pública de todos los archivos en el bucket "perfumes"
CREATE POLICY "Public Access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'perfumes');

-- Política 2: Permitir a usuarios autenticados subir archivos al bucket "perfumes"
CREATE POLICY "Authenticated users can upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'perfumes' 
  AND auth.role() = 'authenticated'
);

-- Política 3: Permitir a usuarios autenticados actualizar sus propios archivos
CREATE POLICY "Authenticated users can update"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'perfumes' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'perfumes' 
  AND auth.role() = 'authenticated'
);

-- Política 4: Permitir a usuarios autenticados eliminar archivos
CREATE POLICY "Authenticated users can delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'perfumes' 
  AND auth.role() = 'authenticated'
);
