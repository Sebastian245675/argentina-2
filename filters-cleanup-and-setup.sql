-- ============================================
-- PASO 1: LIMPIEZA COMPLETA
-- ============================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Filtros son públicos para lectura" ON public.filters;
DROP POLICY IF EXISTS "Administradores pueden insertar filtros" ON public.filters;
DROP POLICY IF EXISTS "Administradores pueden actualizar filtros" ON public.filters;
DROP POLICY IF EXISTS "Administradores pueden eliminar filtros" ON public.filters;
DROP POLICY IF EXISTS "Opciones de filtros son públicas para lectura" ON public.filter_options;
DROP POLICY IF EXISTS "Administradores pueden insertar opciones de filtros" ON public.filter_options;
DROP POLICY IF EXISTS "Administradores pueden actualizar opciones de filtros" ON public.filter_options;
DROP POLICY IF EXISTS "Administradores pueden eliminar opciones de filtros" ON public.filter_options;

-- Eliminar tablas si existen
DROP TABLE IF EXISTS public.filter_options CASCADE;
DROP TABLE IF EXISTS public.filters CASCADE;

-- ============================================
-- PASO 2: CREAR TABLAS
-- ============================================

-- Crear tabla de filtros personalizados
CREATE TABLE public.filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de opciones de filtros
CREATE TABLE public.filter_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID NOT NULL REFERENCES public.filters(id) ON DELETE CASCADE,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PASO 3: CREAR ÍNDICES
-- ============================================

CREATE INDEX idx_filter_options_parent_id ON public.filter_options(parent_id);
CREATE INDEX idx_filters_order ON public.filters("order");
CREATE INDEX idx_filter_options_order ON public.filter_options("order");

-- ============================================
-- PASO 4: HABILITAR RLS
-- ============================================

ALTER TABLE public.filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.filter_options ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 5: CREAR POLÍTICAS RLS
-- ============================================

-- Políticas para FILTERS
CREATE POLICY "Filtros son públicos para lectura" 
ON public.filters FOR SELECT 
TO public
USING (true);

CREATE POLICY "Administradores pueden insertar filtros" 
ON public.filters FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND (users.is_admin = true OR users.email = 'admin@gmail.com')
  )
);

CREATE POLICY "Administradores pueden actualizar filtros" 
ON public.filters FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND (users.is_admin = true OR users.email = 'admin@gmail.com')
  )
);

CREATE POLICY "Administradores pueden eliminar filtros" 
ON public.filters FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND (users.is_admin = true OR users.email = 'admin@gmail.com')
  )
);

-- Políticas para FILTER_OPTIONS
CREATE POLICY "Opciones de filtros son públicas para lectura" 
ON public.filter_options FOR SELECT 
TO public
USING (true);

CREATE POLICY "Administradores pueden insertar opciones de filtros" 
ON public.filter_options FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND (users.is_admin = true OR users.email = 'admin@gmail.com')
  )
);

CREATE POLICY "Administradores pueden actualizar opciones de filtros" 
ON public.filter_options FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND (users.is_admin = true OR users.email = 'admin@gmail.com')
  )
);

CREATE POLICY "Administradores pueden eliminar opciones de filtros" 
ON public.filter_options FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND (users.is_admin = true OR users.email = 'admin@gmail.com')
  )
);

-- ============================================
-- PASO 6: INSERTAR DATOS DE EJEMPLO
-- ============================================

INSERT INTO public.filters (name, "order") VALUES
  ('Mililitros', 0),
  ('Marca', 1),
  ('Precio', 2),
  ('Notas Principales', 3),
  ('Ocasión De Uso', 4),
  ('Estacionalidad', 5);

-- ============================================
-- PASO 7: VERIFICACIÓN
-- ============================================

-- Verificar que las tablas se crearon
SELECT 'Tabla filters creada' as status, COUNT(*) as registros FROM public.filters;
SELECT 'Tabla filter_options creada' as status, COUNT(*) as registros FROM public.filter_options;

-- Verificar políticas
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('filters', 'filter_options');

-- Mostrar los filtros creados
SELECT * FROM public.filters ORDER BY "order";

-- Agregar comentarios
COMMENT ON TABLE public.filters IS 'Filtros personalizados para productos (padre)';
COMMENT ON TABLE public.filter_options IS 'Opciones de filtros personalizados (hijo)';

-- ============================================
-- INFORMACIÓN IMPORTANTE
-- ============================================
-- Después de ejecutar este script:
-- 1. Ve a la sección "API" en Supabase
-- 2. Busca "filters" y "filter_options" en la documentación de la API
-- 3. Si no aparecen, ve a Settings -> API -> API Settings
-- 4. Verifica que las tablas estén habilitadas
-- 5. Puede que necesites refrescar/regenerar el esquema de la API
-- ============================================
