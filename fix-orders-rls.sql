-- =============================================================
-- FIX DEFINITIVO: Tabla "orders" + políticas RLS
-- =============================================================
-- INSTRUCCIONES:
-- 1. Ve a tu panel de Supabase: https://supabase.com/dashboard
-- 2. Entra a tu proyecto (vqkshcozrnqfbxreuczj)
-- 3. Ve a "SQL Editor" en el menú lateral
-- 4. Pega TODO este código y dale a "Run"
-- =============================================================

-- =======================================
-- PASO 1: Asegurar que existan las columnas necesarias
-- =======================================
DO $$
BEGIN
  -- user_name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='user_name') THEN
    ALTER TABLE orders ADD COLUMN user_name text;
  END IF;
  -- user_email
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='user_email') THEN
    ALTER TABLE orders ADD COLUMN user_email text;
  END IF;
  -- user_phone
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='user_phone') THEN
    ALTER TABLE orders ADD COLUMN user_phone text;
  END IF;
  -- delivery_fee
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='delivery_fee') THEN
    ALTER TABLE orders ADD COLUMN delivery_fee numeric DEFAULT 0;
  END IF;
  -- order_type  (online | physical)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='order_type') THEN
    ALTER TABLE orders ADD COLUMN order_type text DEFAULT 'online';
  END IF;
  -- order_notes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='order_notes') THEN
    ALTER TABLE orders ADD COLUMN order_notes text;
  END IF;
  -- confirmed_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='confirmed_at') THEN
    ALTER TABLE orders ADD COLUMN confirmed_at timestamptz;
  END IF;
END
$$;

-- =======================================
-- PASO 2: Asegurar default en created_at
-- =======================================
ALTER TABLE orders ALTER COLUMN created_at SET DEFAULT now();

-- =======================================
-- PASO 3: Limpiar políticas RLS existentes
-- =======================================
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can insert orders" ON orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
DROP POLICY IF EXISTS "Public can insert orders" ON orders;
DROP POLICY IF EXISTS "Admin can read all orders" ON orders;
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "Admin can manage orders" ON orders;
DROP POLICY IF EXISTS "Admin can update orders" ON orders;
DROP POLICY IF EXISTS "Admin can delete orders" ON orders;
DROP POLICY IF EXISTS "Public can read orders" ON orders;
DROP POLICY IF EXISTS "orders_insert_all" ON orders;
DROP POLICY IF EXISTS "orders_select_all" ON orders;
DROP POLICY IF EXISTS "orders_update_all" ON orders;
DROP POLICY IF EXISTS "orders_delete_all" ON orders;

-- Activar RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- =======================================
-- PASO 4: Crear políticas nuevas
-- =======================================

-- 1. CUALQUIER usuario autenticado puede INSERTAR pedidos
CREATE POLICY "Authenticated users can insert orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 2. Los administradores y sub-admins pueden VER TODOS los pedidos
CREATE POLICY "Admin can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
      AND (u2.is_admin = true OR u2.sub_cuenta = 'si')
    )
  );

-- 3. Los usuarios autenticados pueden ver SUS propios pedidos
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 4. Los administradores pueden ACTUALIZAR pedidos (confirmar, cambiar estado)
CREATE POLICY "Admin can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
      AND (u2.is_admin = true OR u2.sub_cuenta = 'si')
    )
  );

-- 5. Los administradores pueden ELIMINAR pedidos
CREATE POLICY "Admin can delete orders"
  ON orders
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
      AND u2.is_admin = true
    )
  );

-- =======================================
-- PASO 5: Verificar que la FK user_id no bloquee inserts
-- =======================================
-- Si la tabla orders tiene FK a users(id) y falla por ello,
-- descomentar la siguiente línea:
-- ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- =======================================
-- LISTO - Verifica ejecutando:
-- =======================================
-- SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;
