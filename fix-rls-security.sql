-- Script para habilitar RLS en todas las tablas y mejorar seguridad
-- Ejecutar este script en Supabase SQL Editor

-- 1. Habilitar RLS en tablas que no lo tienen
ALTER TABLE IF EXISTS revision ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para la tabla revision
-- Solo administradores pueden gestionar revisiones
DROP POLICY IF EXISTS "Admin can manage revisions" ON revision;
CREATE POLICY "Admin can manage revisions"
  ON revision
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
      AND u2.is_admin = true
    )
  );

-- Permitir lectura pública
DROP POLICY IF EXISTS "Public can read revisions" ON revision;
CREATE POLICY "Public can read revisions"
  ON revision
  FOR SELECT
  TO public
  USING (true);

-- 3. Políticas para la tabla categories
-- Solo administradores pueden gestionar categorías
DROP POLICY IF EXISTS "Admin can manage categories" ON categories;
CREATE POLICY "Admin can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
      AND u2.is_admin = true
    )
  );

-- Permitir lectura pública de categorías
DROP POLICY IF EXISTS "Public can read categories" ON categories;
CREATE POLICY "Public can read categories"
  ON categories
  FOR SELECT
  TO public
  USING (true);

-- 4. Mejorar políticas de filter_groups (restringir a administradores)
DROP POLICY IF EXISTS "filter_groups_insert_all" ON filter_groups;
DROP POLICY IF EXISTS "filter_groups_update_all" ON filter_groups;
DROP POLICY IF EXISTS "Admin can manage filter groups" ON filter_groups;

CREATE POLICY "Admin can manage filter groups"
  ON filter_groups
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
      AND u2.is_admin = true
    )
  );

-- 5. Mejorar políticas de filter_options (restringir a administradores)
DROP POLICY IF EXISTS "Todos pueden actualizar opciones de filtros" ON filter_options;
DROP POLICY IF EXISTS "Todos pueden eliminar opciones de filtros" ON filter_options;
DROP POLICY IF EXISTS "Todos pueden insertar opciones de filtros" ON filter_options;
DROP POLICY IF EXISTS "Admin can manage filter options" ON filter_options;

CREATE POLICY "Admin can manage filter options"
  ON filter_options
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
      AND u2.is_admin = true
    )
  );

-- 6. Mejorar políticas de filters (restringir a administradores)
DROP POLICY IF EXISTS "Todos pueden actualizar filtros" ON filters;
DROP POLICY IF EXISTS "Todos pueden eliminar filtros" ON filters;
DROP POLICY IF EXISTS "Todos pueden insertar filtros" ON filters;
DROP POLICY IF EXISTS "Admin can manage filters" ON filters;

CREATE POLICY "Admin can manage filters"
  ON filters
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
      AND u2.is_admin = true
    )
  );

-- 7. Mejorar políticas de info_sections (restringir a administradores)
DROP POLICY IF EXISTS "info_sections_update_all" ON info_sections;
DROP POLICY IF EXISTS "info_sections_write_all" ON info_sections;
DROP POLICY IF EXISTS "Admin can manage info sections" ON info_sections;

CREATE POLICY "Admin can manage info sections"
  ON info_sections
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
      AND u2.is_admin = true
    )
  );

-- 8. Mejorar políticas de settings (restringir a administradores)
DROP POLICY IF EXISTS "Public insert access" ON settings;
DROP POLICY IF EXISTS "Public update access" ON settings;
DROP POLICY IF EXISTS "Admin can manage settings" ON settings;

CREATE POLICY "Admin can manage settings"
  ON settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
      AND u2.is_admin = true
    )
  );

-- Permitir lectura pública de settings
DROP POLICY IF EXISTS "Public can read settings" ON settings;
CREATE POLICY "Public can read settings"
  ON settings
  FOR SELECT
  TO public
  USING (true);

-- 9. Mejorar políticas de product_filter_groups
DROP POLICY IF EXISTS "product_filter_groups_delete_all" ON product_filter_groups;
DROP POLICY IF EXISTS "product_filter_groups_insert_all" ON product_filter_groups;
DROP POLICY IF EXISTS "Admin can manage product filter groups" ON product_filter_groups;

CREATE POLICY "Admin can manage product filter groups"
  ON product_filter_groups
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
      AND u2.is_admin = true
    )
  );

-- Permitir lectura pública
DROP POLICY IF EXISTS "Public can read product filter groups" ON product_filter_groups;
CREATE POLICY "Public can read product filter groups"
  ON product_filter_groups
  FOR SELECT
  TO public
  USING (true);

-- 10. Mejorar políticas de product_analytics (mantener inserción pública pero restringir updates)
DROP POLICY IF EXISTS "product_analytics_insert_all" ON product_analytics;
DROP POLICY IF EXISTS "product_analytics_update_all" ON product_analytics;

-- Permitir inserción pública para tracking
CREATE POLICY "Public can insert product analytics"
  ON product_analytics
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Solo admins pueden actualizar
CREATE POLICY "Admin can update product analytics"
  ON product_analytics
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
      AND u2.is_admin = true
    )
  );

-- Permitir lectura pública
CREATE POLICY "Public can read product analytics"
  ON product_analytics
  FOR SELECT
  TO public
  USING (true);

-- 11. Mejorar políticas de product_views (mantener inserción pública)
DROP POLICY IF EXISTS "product_views_insert_all" ON product_views;

CREATE POLICY "Public can insert product views"
  ON product_views
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can read product views"
  ON product_views
  FOR SELECT
  TO public
  USING (true);

-- 12. Mejorar políticas de website_visits (mantener inserción pública)
DROP POLICY IF EXISTS "website_visits_insert_all" ON website_visits;

CREATE POLICY "Public can insert website visits"
  ON website_visits
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Solo admins pueden leer analytics
CREATE POLICY "Admin can read website visits"
  ON website_visits
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
      AND u2.is_admin = true
    )
  );

-- 13. Mejorar política de product_reviews
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear reseñas" ON product_reviews;

-- Usuarios autenticados pueden crear reseñas (validar con constraint UNIQUE)
CREATE POLICY "Authenticated users can create reviews"
  ON product_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE users IS 'Tabla de usuarios del sistema con RLS mejorado';
