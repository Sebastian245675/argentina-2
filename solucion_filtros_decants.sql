-- ==========================================
-- SCRIPT DE INSERCIÓN: 17 DECANTS 5ML Y FILTRO
-- Ejecutar este archivo completo en la consola SQL de Supabase
-- ==========================================

-- 1. Asegurarse de que el filtro 'Tipo' existe y crear la opción 'Decant 5ML'
DO $$
DECLARE
  v_tipo_filter_id UUID;
  v_decant_5ml_option_id UUID;
BEGIN
  -- Intentar obtener el ID del filtro 'Tipo'
  SELECT id INTO v_tipo_filter_id FROM filters WHERE name = 'Tipo' LIMIT 1;
  
  -- Si el filtro 'Tipo' aún no existe, lo creamos
  IF v_tipo_filter_id IS NULL THEN
     v_tipo_filter_id := gen_random_uuid();
     INSERT INTO filters (id, name, "order") VALUES (v_tipo_filter_id, 'Tipo', 0);
  END IF;

  -- Comprobar si ya existe la opción 'Decant 5ML' para no crearla duplicada
  SELECT id INTO v_decant_5ml_option_id FROM filter_options WHERE parent_id = v_tipo_filter_id AND name = 'Decant 5ML' LIMIT 1;

  IF v_decant_5ml_option_id IS NULL THEN
     v_decant_5ml_option_id := gen_random_uuid();
     INSERT INTO filter_options (id, name, parent_id, "order") VALUES (v_decant_5ml_option_id, 'Decant 5ML', v_tipo_filter_id, 3);
  END IF;
  
  -- Para usar en las inserciones, guardamos los UUIDs en una tabla temporal
  CREATE TEMP TABLE IF NOT EXISTS tmp_vars (key text primary key, val uuid);
  INSERT INTO tmp_vars (key, val) VALUES ('tipo_id', v_tipo_filter_id) ON CONFLICT (key) DO UPDATE SET val = v_tipo_filter_id;
  INSERT INTO tmp_vars (key, val) VALUES ('decant_5ml_id', v_decant_5ml_option_id) ON CONFLICT (key) DO UPDATE SET val = v_decant_5ml_option_id;

END $$;

-- 2. Inserción de Productos
DO $$
DECLARE
  v_decant_5ml_id UUID;
  v_tipo_id UUID;
  v_json_spec JSONB;
BEGIN
  SELECT val INTO v_decant_5ml_id FROM tmp_vars WHERE key = 'decant_5ml_id';
  SELECT val INTO v_tipo_id FROM tmp_vars WHERE key = 'tipo_id';
  
  -- Construir el JSONB referenciando dinámicamente los UUIDs
  v_json_spec := jsonb_build_array(
      jsonb_build_object('tipo', 'decant'),
      jsonb_build_object('name', '_filter_options', 'value', json_build_object(v_tipo_id::text, json_build_array(v_decant_5ml_id::text))::text)
  );

  -- 1) tobacco roush afnan
  DELETE FROM products WHERE name = 'tobacco roush afnan - Decant 5ML';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  SELECT 'tobacco roush afnan - Decant 5ML', 8000, 8000, 10, 'decant', 'decant', true, 
         (SELECT image FROM products WHERE name ILIKE '%tobacco%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1),
         COALESCE((SELECT additional_images FROM products WHERE name ILIKE '%tobacco%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1), ARRAY[]::TEXT[]),
         v_json_spec;

  -- 2) mandarin sky
  DELETE FROM products WHERE name = 'mandarin sky - Decant 5ML';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  SELECT 'mandarin sky - Decant 5ML', 8000, 8000, 10, 'decant', 'decant', true, 
         (SELECT image FROM products WHERE name ILIKE '%mandarin%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1),
         COALESCE((SELECT additional_images FROM products WHERE name ILIKE '%mandarin%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1), ARRAY[]::TEXT[]),
         v_json_spec;

  -- 3) rayhaan valhalla
  DELETE FROM products WHERE name = 'rayhaan valhalla - Decant 5ML';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  SELECT 'rayhaan valhalla - Decant 5ML', 8000, 8000, 10, 'decant', 'decant', true, 
         (SELECT image FROM products WHERE name ILIKE '%valhalla%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1),
         COALESCE((SELECT additional_images FROM products WHERE name ILIKE '%valhalla%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1), ARRAY[]::TEXT[]),
         v_json_spec;

  -- 4) rayhaan corium
  DELETE FROM products WHERE name = 'rayhaan corium - Decant 5ML';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  SELECT 'rayhaan corium - Decant 5ML', 8000, 8000, 10, 'decant', 'decant', true, 
         (SELECT image FROM products WHERE name ILIKE '%corium%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1),
         COALESCE((SELECT additional_images FROM products WHERE name ILIKE '%corium%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1), ARRAY[]::TEXT[]),
         v_json_spec;

  -- 5) rayhaan jungle vibes
  DELETE FROM products WHERE name = 'rayhaan jungle vibes - Decant 5ML';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  SELECT 'rayhaan jungle vibes - Decant 5ML', 8000, 8000, 10, 'decant', 'decant', true, 
         (SELECT image FROM products WHERE name ILIKE '%jungle%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1),
         COALESCE((SELECT additional_images FROM products WHERE name ILIKE '%jungle%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1), ARRAY[]::TEXT[]),
         v_json_spec;

  -- 6) asad elixir
  DELETE FROM products WHERE name = 'asad elixir - Decant 5ML';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  SELECT 'asad elixir - Decant 5ML', 8000, 8000, 10, 'decant', 'decant', true, 
         (SELECT image FROM products WHERE name ILIKE '%elixir%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1),
         COALESCE((SELECT additional_images FROM products WHERE name ILIKE '%elixir%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1), ARRAY[]::TEXT[]),
         v_json_spec;

  -- 7) sehr
  DELETE FROM products WHERE name = 'sehr - Decant 5ML';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  SELECT 'sehr - Decant 5ML', 8000, 8000, 10, 'decant', 'decant', true, 
         (SELECT image FROM products WHERE name ILIKE '%sehr%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1),
         COALESCE((SELECT additional_images FROM products WHERE name ILIKE '%sehr%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1), ARRAY[]::TEXT[]),
         v_json_spec;

  -- 8) atlas
  DELETE FROM products WHERE name = 'atlas - Decant 5ML';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  SELECT 'atlas - Decant 5ML', 10000, 10000, 10, 'decant', 'decant', true, 
         (SELECT image FROM products WHERE name ILIKE '%atlas%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1),
         COALESCE((SELECT additional_images FROM products WHERE name ILIKE '%atlas%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1), ARRAY[]::TEXT[]),
         v_json_spec;

  -- 9) CK i2u for him
  DELETE FROM products WHERE name = 'CK i2u for him - Decant 5ML';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  SELECT 'CK i2u for him - Decant 5ML', 8000, 8000, 10, 'decant', 'decant', true, 
         (SELECT image FROM products WHERE name ILIKE '%i2u%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1),
         COALESCE((SELECT additional_images FROM products WHERE name ILIKE '%i2u%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1), ARRAY[]::TEXT[]),
         v_json_spec;

  -- 10) Mercedes club Black men
  DELETE FROM products WHERE name = 'Mercedes club Black men - Decant 5ML';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  SELECT 'Mercedes club Black men - Decant 5ML', 10000, 10000, 10, 'decant', 'decant', true, 
         (SELECT image FROM products WHERE name ILIKE '%Mercedes%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1),
         COALESCE((SELECT additional_images FROM products WHERE name ILIKE '%Mercedes%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1), ARRAY[]::TEXT[]),
         v_json_spec;

  -- 11) one millón Privé
  DELETE FROM products WHERE name = 'one millón Privé - Decant 5ML';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  SELECT 'one millón Privé - Decant 5ML', 16500, 16500, 10, 'decant', 'decant', true, 
         (SELECT image FROM products WHERE name ILIKE '%millón%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1),
         COALESCE((SELECT additional_images FROM products WHERE name ILIKE '%millón%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1), ARRAY[]::TEXT[]),
         v_json_spec;

  -- 12) le male elixir
  DELETE FROM products WHERE name = 'le male elixir - Decant 5ML';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  SELECT 'le male elixir - Decant 5ML', 13500, 13500, 10, 'decant', 'decant', true, 
         (SELECT image FROM products WHERE name ILIKE '%male%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1),
         COALESCE((SELECT additional_images FROM products WHERE name ILIKE '%male%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1), ARRAY[]::TEXT[]),
         v_json_spec;

  -- 13) Amber oud gold edition
  DELETE FROM products WHERE name = 'Amber oud gold edition - Decant 5ML';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  SELECT 'Amber oud gold edition - Decant 5ML', 10000, 10000, 10, 'decant', 'decant', true, 
         (SELECT image FROM products WHERE name ILIKE '%gold%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1),
         COALESCE((SELECT additional_images FROM products WHERE name ILIKE '%gold%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1), ARRAY[]::TEXT[]),
         v_json_spec;

  -- 14) Chanel Allure Homme Sport Extreme
  DELETE FROM products WHERE name = 'Chanel Allure Homme Sport Extreme - Decant 5ML';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  SELECT 'Chanel Allure Homme Sport Extreme - Decant 5ML', 20000, 20000, 10, 'decant', 'decant', true, 
         (SELECT image FROM products WHERE name ILIKE '%Allure%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1),
         COALESCE((SELECT additional_images FROM products WHERE name ILIKE '%Allure%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1), ARRAY[]::TEXT[]),
         v_json_spec;

  -- 15) Prada ocean edt
  DELETE FROM products WHERE name = 'Prada ocean edt - Decant 5ML';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  SELECT 'Prada ocean edt - Decant 5ML', 13500, 13500, 10, 'decant', 'decant', true, 
         (SELECT image FROM products WHERE name ILIKE '%Prada%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1),
         COALESCE((SELECT additional_images FROM products WHERE name ILIKE '%Prada%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1), ARRAY[]::TEXT[]),
         v_json_spec;

  -- 16) Valentino Born in Roma intense
  DELETE FROM products WHERE name = 'Valentino Born in Roma intense - Decant 5ML';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  SELECT 'Valentino Born in Roma intense - Decant 5ML', 16500, 16500, 10, 'decant', 'decant', true, 
         (SELECT image FROM products WHERE name ILIKE '%Valentino%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1),
         COALESCE((SELECT additional_images FROM products WHERE name ILIKE '%Valentino%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1), ARRAY[]::TEXT[]),
         v_json_spec;

  -- 17) Rayhaan Crimson
  DELETE FROM products WHERE name = 'Rayhaan Crimson - Decant 5ML';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  SELECT 'Rayhaan Crimson - Decant 5ML', 8000, 8000, 10, 'decant', 'decant', true, 
         (SELECT image FROM products WHERE name ILIKE '%Crimson%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1),
         COALESCE((SELECT additional_images FROM products WHERE name ILIKE '%Crimson%' AND name NOT ILIKE '%decant%' ORDER BY id DESC LIMIT 1), ARRAY[]::TEXT[]),
         v_json_spec;

END $$;
