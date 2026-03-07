-- Script para agregar políticas RLS faltantes que están causando errores 500
-- Ejecutar DESPUÉS de users-rls-policies.sql y fix-rls-security.sql

-- 1. Políticas para company_profile
ALTER TABLE IF EXISTS company_profile ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública del perfil de empresa
DROP POLICY IF EXISTS "Public can read company profile" ON company_profile;
CREATE POLICY "Public can read company profile"
  ON company_profile
  FOR SELECT
  TO public
  USING (true);

-- Solo administradores pueden gestionar el perfil
DROP POLICY IF EXISTS "Admin can manage company profile" ON company_profile;
CREATE POLICY "Admin can manage company profile"
  ON company_profile
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
      AND u2.is_admin = true
    )
  );

-- 2. Agregar política faltante para usuarios autenticados ver subcuentas
-- Los administradores necesitan poder ver la lista de subcuentas
DROP POLICY IF EXISTS "Authenticated users can read all users" ON users;
CREATE POLICY "Authenticated users can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- Puede ver su propio perfil
    auth.uid() = id
    OR
    -- O es administrador
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
      AND u2.is_admin = true
    )
  );

-- 3. Políticas para contacts (formulario de contacto)
ALTER TABLE IF EXISTS contacts ENABLE ROW LEVEL SECURITY;

-- Permitir inserción pública de contactos
DROP POLICY IF EXISTS "Public can insert contacts" ON contacts;
CREATE POLICY "Public can insert contacts"
  ON contacts
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Solo administradores pueden leer y gestionar contactos
DROP POLICY IF EXISTS "Admin can manage contacts" ON contacts;
CREATE POLICY "Admin can manage contacts"
  ON contacts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
      AND u2.is_admin = true
    )
  );

-- 4. Políticas para products (lectura pública, gestión admin)
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read products" ON products;
CREATE POLICY "Public can read products"
  ON products
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Admin can manage products" ON products;
CREATE POLICY "Admin can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
      AND u2.is_admin = true
    )
  );

-- 5. Políticas para orders
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver sus propias órdenes
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
      AND u2.is_admin = true
    )
  );

-- Los usuarios pueden crear sus propias órdenes
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Los administradores pueden gestionar todas las órdenes
DROP POLICY IF EXISTS "Admin can manage orders" ON orders;
CREATE POLICY "Admin can manage orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
      AND u2.is_admin = true
    )
  );

-- 6. Políticas para product_reviews (lectura pública)
DROP POLICY IF EXISTS "Public can read reviews" ON product_reviews;
CREATE POLICY "Public can read reviews"
  ON product_reviews
  FOR SELECT
  TO public
  USING (true);

-- Los usuarios pueden actualizar sus propias reseñas
DROP POLICY IF EXISTS "Users can update own reviews" ON product_reviews;
CREATE POLICY "Users can update own reviews"
  ON product_reviews
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Los usuarios pueden eliminar sus propias reseñas
DROP POLICY IF EXISTS "Users can delete own reviews" ON product_reviews;
CREATE POLICY "Users can delete own reviews"
  ON product_reviews
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Los administradores pueden gestionar todas las reseñas
DROP POLICY IF EXISTS "Admin can manage all reviews" ON product_reviews;
CREATE POLICY "Admin can manage all reviews"
  ON product_reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
      AND u2.is_admin = true
    )
  );

COMMENT ON TABLE company_profile IS 'Perfil de la empresa con políticas RLS configuradas';
COMMENT ON TABLE contacts IS 'Tabla de contactos con inserción pública y gestión admin';
COMMENT ON TABLE products IS 'Productos con lectura pública y gestión admin';
COMMENT ON TABLE orders IS 'Órdenes con acceso por usuario y gestión admin';
