-- =============================================================
-- FIX DEFINITIVO: Arreglar políticas RLS de la tabla "orders"
-- =============================================================
-- PROBLEMA ENCONTRADO:
-- 1. La tabla orders NO tiene las columnas: payment_method, 
--    payment_id, external_reference, confirmed_at, etc.
--    → Ya arreglado en el código (OrderSuccess.tsx)
--
-- 2. La tabla orders tiene RLS activado pero NO permite INSERT
--    desde usuarios autenticados ni anónimos.
--    → Este script lo arregla.
--
-- INSTRUCCIONES:
-- 1. Ve a tu panel de Supabase: https://supabase.com/dashboard
-- 2. Entra a tu proyecto (vqkshcozrnqfbxreuczj)
-- 3. Ve a "SQL Editor" en el menú lateral
-- 4. Pega TODO este código y dale a "Run"
-- =============================================================

-- Limpiar políticas existentes de orders
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can insert orders" ON orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
DROP POLICY IF EXISTS "Public can insert orders" ON orders;
DROP POLICY IF EXISTS "Admin can read all orders" ON orders;
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "Admin can manage orders" ON orders;
DROP POLICY IF EXISTS "Admin can update orders" ON orders;
DROP POLICY IF EXISTS "Admin can delete orders" ON orders;
DROP POLICY IF EXISTS "orders_insert_all" ON orders;
DROP POLICY IF EXISTS "orders_select_all" ON orders;
DROP POLICY IF EXISTS "orders_update_all" ON orders;
DROP POLICY IF EXISTS "orders_delete_all" ON orders;

-- 1. CUALQUIER PERSONA puede crear un pedido (usuarios logueados + invitados)
CREATE POLICY "Anyone can insert orders"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 2. Los administradores y sub-admins pueden VER todos los pedidos
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

-- 4. Los administradores pueden ACTUALIZAR pedidos (confirmar, etc.)
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

-- También permitir lectura anónima para que el insert + select funcione
-- (necesario para que el .select() después del insert funcione)
CREATE POLICY "Public can read orders"
  ON orders
  FOR SELECT
  TO anon
  USING (false);  -- Los anónimos NO pueden leer pedidos, solo insertarlos
