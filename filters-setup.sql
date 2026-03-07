-- Script para crear las tablas de filtros en Supabase
-- Ejecuta este script en el editor SQL de Supabase

-- Crear tabla de filtros personalizados
CREATE TABLE IF NOT EXISTS public.filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de opciones de filtros
CREATE TABLE IF NOT EXISTS public.filter_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID NOT NULL REFERENCES public.filters(id) ON DELETE CASCADE,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para mejorar performance
CREATE INDEX IF NOT EXISTS idx_filter_options_parent_id ON public.filter_options(parent_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.filter_options ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para filters (público para leer, solo admin para escribir)
CREATE POLICY "Filtros son públicos para lectura" ON public.filters
  FOR SELECT USING (true);

CREATE POLICY "Administradores pueden insertar filtros" ON public.filters
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND (users.is_admin = true OR users.email = 'admin@gmail.com')
    )
  );

CREATE POLICY "Administradores pueden actualizar filtros" ON public.filters
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND (users.is_admin = true OR users.email = 'admin@gmail.com')
    )
  );

CREATE POLICY "Administradores pueden eliminar filtros" ON public.filters
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND (users.is_admin = true OR users.email = 'admin@gmail.com')
    )
  );

-- Políticas de RLS para filter_options (público para leer, solo admin para escribir)
CREATE POLICY "Opciones de filtros son públicas para lectura" ON public.filter_options
  FOR SELECT USING (true);

CREATE POLICY "Administradores pueden insertar opciones de filtros" ON public.filter_options
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND (users.is_admin = true OR users.email = 'admin@gmail.com')
    )
  );

CREATE POLICY "Administradores pueden actualizar opciones de filtros" ON public.filter_options
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND (users.is_admin = true OR users.email = 'admin@gmail.com')
    )
  );

CREATE POLICY "Administradores pueden eliminar opciones de filtros" ON public.filter_options
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND (users.is_admin = true OR users.email = 'admin@gmail.com')
    )
  );

-- Insertar algunos filtros de ejemplo
INSERT INTO public.filters (name, "order") VALUES
  ('Mililitros', 0),
  ('Marca', 1),
  ('Precio', 2),
  ('Notas Principales', 3),
  ('Ocasión De Uso', 4),
  ('Estacionalidad', 5)
ON CONFLICT DO NOTHING;

-- Obtener los IDs de los filtros (necesitarás ajustar estos IDs según los que se generen)
-- Para insertar las opciones, ejecuta una consulta SELECT para obtener los IDs primero:
-- SELECT id, name FROM public.filters ORDER BY "order";

-- Ejemplo de cómo insertar opciones (ajusta los parent_id con los IDs reales):
-- INSERT INTO public.filter_options (name, parent_id, "order") VALUES
--   ('2.5', 'ID_DEL_FILTRO_MILILITROS', 0),
--   ('5', 'ID_DEL_FILTRO_MILILITROS', 1),
--   ('10', 'ID_DEL_FILTRO_MILILITROS', 2),
--   ('30', 'ID_DEL_FILTRO_MILILITROS', 3),
--   ('100', 'ID_DEL_FILTRO_MILILITROS', 4);

COMMENT ON TABLE public.filters IS 'Filtros personalizados para productos (padre)';
COMMENT ON TABLE public.filter_options IS 'Opciones de filtros personalizados (hijo)';
