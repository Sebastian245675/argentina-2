-- ============================================
-- CREAR TABLA DE CONTACTOS SI NO EXISTE
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Tabla de contactos
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  company TEXT,
  tags TEXT[] DEFAULT '{}',
  avatar TEXT,
  last_activity TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Política para que usuarios autenticados puedan todo
CREATE POLICY IF NOT EXISTS "Authenticated users can do everything with contacts" 
  ON contacts FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Política para lectura anónima (opcional, si quieres)
CREATE POLICY IF NOT EXISTS "Public can read contacts" 
  ON contacts FOR SELECT 
  TO anon 
  USING (true);

-- ============================================
-- CREAR TABLA DE REVISIONES SI NO EXISTE
-- ============================================

CREATE TABLE IF NOT EXISTS revision (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- 'add', 'edit', 'delete', 'info_edit', 'info_toggle'
  data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pendiente',
  "timestamp" TEXT,
  "editorEmail" TEXT,
  "userName" TEXT,
  "sectionId" TEXT,
  "sectionTitle" TEXT,
  entity TEXT,
  "userId" TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE revision ENABLE ROW LEVEL SECURITY;

-- Política para usuarios autenticados
CREATE POLICY IF NOT EXISTS "Authenticated users can do everything with revisions" 
  ON revision FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Política para lectura anónima
CREATE POLICY IF NOT EXISTS "Public can read revisions" 
  ON revision FOR SELECT 
  TO anon 
  USING (true);
