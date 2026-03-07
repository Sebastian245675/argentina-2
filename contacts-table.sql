-- Tabla para contactos
-- Ejecuta este script en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  company TEXT,
  avatar TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE,
  created_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT
);

-- Habilitar Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios autenticados pueden leer todos los contactos
CREATE POLICY "Usuarios autenticados pueden ver contactos" ON public.contacts
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Política: Usuarios autenticados pueden insertar contactos
CREATE POLICY "Usuarios autenticados pueden insertar contactos" ON public.contacts
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Política: Usuarios autenticados pueden actualizar contactos
CREATE POLICY "Usuarios autenticados pueden actualizar contactos" ON public.contacts
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Política: Usuarios autenticados pueden eliminar contactos
CREATE POLICY "Usuarios autenticados pueden eliminar contactos" ON public.contacts
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Índices para mejorar el rendimiento de búsquedas
CREATE INDEX IF NOT EXISTS idx_contacts_name ON public.contacts(name);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON public.contacts(phone);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts(created_at DESC);
