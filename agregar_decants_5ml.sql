-- ==========================================
-- SCRIPT COMPLETO: FILTRO "Decants 5ml" + 17 PRODUCTOS
-- Ejecutar completo en la consola SQL de Supabase
-- ==========================================

-- ========== PASO 1: Crear la opción "Decants 5ml" en el filtro "Tipo" ==========
DO $$
DECLARE
  v_tipo_filter_id UUID;
  v_decants_5ml_option_id UUID;
  v_max_order INT;
BEGIN
  -- Obtener el ID del filtro 'Tipo'
  SELECT id INTO v_tipo_filter_id FROM filters WHERE name = 'Tipo' LIMIT 1;
  
  IF v_tipo_filter_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró el filtro "Tipo". Créalo primero.';
  END IF;

  -- Verificar si ya existe la opción "Decants 5ml"
  SELECT id INTO v_decants_5ml_option_id 
  FROM filter_options 
  WHERE parent_id = v_tipo_filter_id AND name = 'Decants 5ml' 
  LIMIT 1;

  IF v_decants_5ml_option_id IS NULL THEN
    -- Obtener el order de "Decants" para poner "Decants 5ml" justo después
    SELECT COALESCE(MAX("order"), 0) INTO v_max_order
    FROM filter_options 
    WHERE parent_id = v_tipo_filter_id AND name ILIKE 'Decant%';

    -- Mover las opciones que estén después para hacer espacio
    UPDATE filter_options 
    SET "order" = "order" + 1 
    WHERE parent_id = v_tipo_filter_id AND "order" > v_max_order;

    -- Insertar "Decants 5ml" justo después de "Decants"
    INSERT INTO filter_options (id, name, parent_id, "order") 
    VALUES (gen_random_uuid(), 'Decants 5ml', v_tipo_filter_id, v_max_order + 1)
    RETURNING id INTO v_decants_5ml_option_id;

    RAISE NOTICE '✅ Opción "Decants 5ml" creada con ID: %', v_decants_5ml_option_id;
  ELSE
    RAISE NOTICE '⚠️ La opción "Decants 5ml" ya existe con ID: %', v_decants_5ml_option_id;
  END IF;

  -- Guardar en tabla temporal para usar después
  CREATE TEMP TABLE IF NOT EXISTS tmp_vars (key text PRIMARY KEY, val uuid);
  INSERT INTO tmp_vars (key, val) VALUES ('tipo_id', v_tipo_filter_id) ON CONFLICT (key) DO UPDATE SET val = v_tipo_filter_id;
  INSERT INTO tmp_vars (key, val) VALUES ('decants_5ml_id', v_decants_5ml_option_id) ON CONFLICT (key) DO UPDATE SET val = v_decants_5ml_option_id;
END $$;

-- ========== PASO 2: Insertar los 17 productos Decant 5ml ==========
DO $$
DECLARE
  v_decants_5ml_id UUID;
  v_tipo_id UUID;
  v_filter_spec JSONB;
  v_img TEXT;
  v_add_imgs TEXT[];
BEGIN
  SELECT val INTO v_tipo_id FROM tmp_vars WHERE key = 'tipo_id';
  SELECT val INTO v_decants_5ml_id FROM tmp_vars WHERE key = 'decants_5ml_id';
  
  -- Construir el spec de filtro que vincula al filtro "Decants 5ml"
  v_filter_spec := jsonb_build_array(
    jsonb_build_object('tipo', 'decant'),
    jsonb_build_object('name', '_filter_options', 'value', 
      json_build_object(v_tipo_id::text, json_build_array(v_decants_5ml_id::text))::text
    )
  );

  -- ================================================================
  -- 1) tobacco roush afnan - $8.000
  -- ================================================================
  SELECT image INTO v_img FROM products WHERE name ILIKE '%tobacco%roush%' AND name NOT ILIKE '%decant%' LIMIT 1;
  IF v_img IS NULL THEN SELECT image INTO v_img FROM products WHERE name ILIKE '%tobacco%' AND name NOT ILIKE '%decant%' LIMIT 1; END IF;
  SELECT additional_images INTO v_add_imgs FROM products WHERE name ILIKE '%tobacco%roush%' AND name NOT ILIKE '%decant%' LIMIT 1;
  
  DELETE FROM products WHERE name = 'tobacco roush afnan - Decant 5ml';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  VALUES ('tobacco roush afnan - Decant 5ml', 8000, 8000, 10, 'decant', 'decant', true, v_img, COALESCE(v_add_imgs, ARRAY[]::TEXT[]), v_filter_spec);
  RAISE NOTICE '✅ 1/17 tobacco roush afnan';

  -- ================================================================
  -- 2) mandarin sky - $8.000
  -- ================================================================
  SELECT image INTO v_img FROM products WHERE name ILIKE '%mandarin%sky%' AND name NOT ILIKE '%decant%' LIMIT 1;
  IF v_img IS NULL THEN SELECT image INTO v_img FROM products WHERE name ILIKE '%mandarin%' AND name NOT ILIKE '%decant%' LIMIT 1; END IF;
  SELECT additional_images INTO v_add_imgs FROM products WHERE name ILIKE '%mandarin%sky%' AND name NOT ILIKE '%decant%' LIMIT 1;

  DELETE FROM products WHERE name = 'mandarin sky - Decant 5ml';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  VALUES ('mandarin sky - Decant 5ml', 8000, 8000, 10, 'decant', 'decant', true, v_img, COALESCE(v_add_imgs, ARRAY[]::TEXT[]), v_filter_spec);
  RAISE NOTICE '✅ 2/17 mandarin sky';

  -- ================================================================
  -- 3) rayhaan valhalla - $8.000
  -- ================================================================
  SELECT image INTO v_img FROM products WHERE name ILIKE '%valhalla%' AND name NOT ILIKE '%decant%' LIMIT 1;
  SELECT additional_images INTO v_add_imgs FROM products WHERE name ILIKE '%valhalla%' AND name NOT ILIKE '%decant%' LIMIT 1;

  DELETE FROM products WHERE name = 'rayhaan valhalla - Decant 5ml';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  VALUES ('rayhaan valhalla - Decant 5ml', 8000, 8000, 10, 'decant', 'decant', true, v_img, COALESCE(v_add_imgs, ARRAY[]::TEXT[]), v_filter_spec);
  RAISE NOTICE '✅ 3/17 rayhaan valhalla';

  -- ================================================================
  -- 4) rayhaan corium - $8.000
  -- ================================================================
  SELECT image INTO v_img FROM products WHERE name ILIKE '%corium%' AND name NOT ILIKE '%decant%' LIMIT 1;
  SELECT additional_images INTO v_add_imgs FROM products WHERE name ILIKE '%corium%' AND name NOT ILIKE '%decant%' LIMIT 1;

  DELETE FROM products WHERE name = 'rayhaan corium - Decant 5ml';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  VALUES ('rayhaan corium - Decant 5ml', 8000, 8000, 10, 'decant', 'decant', true, v_img, COALESCE(v_add_imgs, ARRAY[]::TEXT[]), v_filter_spec);
  RAISE NOTICE '✅ 4/17 rayhaan corium';

  -- ================================================================
  -- 5) rayhaan jungle vibes - $8.000
  -- ================================================================
  SELECT image INTO v_img FROM products WHERE name ILIKE '%jungle%vibes%' AND name NOT ILIKE '%decant%' LIMIT 1;
  IF v_img IS NULL THEN SELECT image INTO v_img FROM products WHERE name ILIKE '%jungle%' AND name NOT ILIKE '%decant%' LIMIT 1; END IF;
  SELECT additional_images INTO v_add_imgs FROM products WHERE name ILIKE '%jungle%vibes%' AND name NOT ILIKE '%decant%' LIMIT 1;

  DELETE FROM products WHERE name = 'rayhaan jungle vibes - Decant 5ml';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  VALUES ('rayhaan jungle vibes - Decant 5ml', 8000, 8000, 10, 'decant', 'decant', true, v_img, COALESCE(v_add_imgs, ARRAY[]::TEXT[]), v_filter_spec);
  RAISE NOTICE '✅ 5/17 rayhaan jungle vibes';

  -- ================================================================
  -- 6) asad elixir - $8.000
  -- ================================================================
  SELECT image INTO v_img FROM products WHERE name ILIKE '%asad%elixir%' AND name NOT ILIKE '%decant%' LIMIT 1;
  IF v_img IS NULL THEN SELECT image INTO v_img FROM products WHERE name ILIKE '%asad%' AND name NOT ILIKE '%decant%' LIMIT 1; END IF;
  SELECT additional_images INTO v_add_imgs FROM products WHERE name ILIKE '%asad%elixir%' AND name NOT ILIKE '%decant%' LIMIT 1;

  DELETE FROM products WHERE name = 'asad elixir - Decant 5ml';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  VALUES ('asad elixir - Decant 5ml', 8000, 8000, 10, 'decant', 'decant', true, v_img, COALESCE(v_add_imgs, ARRAY[]::TEXT[]), v_filter_spec);
  RAISE NOTICE '✅ 6/17 asad elixir';

  -- ================================================================
  -- 7) sehr - $8.000
  -- ================================================================
  SELECT image INTO v_img FROM products WHERE name ILIKE '%sehr%' AND name NOT ILIKE '%decant%' LIMIT 1;
  SELECT additional_images INTO v_add_imgs FROM products WHERE name ILIKE '%sehr%' AND name NOT ILIKE '%decant%' LIMIT 1;

  DELETE FROM products WHERE name = 'sehr - Decant 5ml';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  VALUES ('sehr - Decant 5ml', 8000, 8000, 10, 'decant', 'decant', true, v_img, COALESCE(v_add_imgs, ARRAY[]::TEXT[]), v_filter_spec);
  RAISE NOTICE '✅ 7/17 sehr';

  -- ================================================================
  -- 8) atlas - $10.000
  -- ================================================================
  SELECT image INTO v_img FROM products WHERE name ILIKE '%atlas%' AND name NOT ILIKE '%decant%' LIMIT 1;
  SELECT additional_images INTO v_add_imgs FROM products WHERE name ILIKE '%atlas%' AND name NOT ILIKE '%decant%' LIMIT 1;

  DELETE FROM products WHERE name = 'atlas - Decant 5ml';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  VALUES ('atlas - Decant 5ml', 10000, 10000, 10, 'decant', 'decant', true, v_img, COALESCE(v_add_imgs, ARRAY[]::TEXT[]), v_filter_spec);
  RAISE NOTICE '✅ 8/17 atlas';

  -- ================================================================
  -- 9) CK i2u for him - $8.000
  -- ================================================================
  SELECT image INTO v_img FROM products WHERE name ILIKE '%i2u%' AND name NOT ILIKE '%decant%' LIMIT 1;
  IF v_img IS NULL THEN SELECT image INTO v_img FROM products WHERE name ILIKE '%CK%' AND name NOT ILIKE '%decant%' LIMIT 1; END IF;
  SELECT additional_images INTO v_add_imgs FROM products WHERE name ILIKE '%i2u%' AND name NOT ILIKE '%decant%' LIMIT 1;

  DELETE FROM products WHERE name = 'CK i2u for him - Decant 5ml';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  VALUES ('CK i2u for him - Decant 5ml', 8000, 8000, 10, 'decant', 'decant', true, v_img, COALESCE(v_add_imgs, ARRAY[]::TEXT[]), v_filter_spec);
  RAISE NOTICE '✅ 9/17 CK i2u for him';

  -- ================================================================
  -- 10) Mercedes club Black men - $10.000
  -- ================================================================
  SELECT image INTO v_img FROM products WHERE name ILIKE '%Mercedes%club%Black%' AND name NOT ILIKE '%decant%' LIMIT 1;
  IF v_img IS NULL THEN SELECT image INTO v_img FROM products WHERE name ILIKE '%Mercedes%' AND name NOT ILIKE '%decant%' LIMIT 1; END IF;
  SELECT additional_images INTO v_add_imgs FROM products WHERE name ILIKE '%Mercedes%club%Black%' AND name NOT ILIKE '%decant%' LIMIT 1;

  DELETE FROM products WHERE name = 'Mercedes club Black men - Decant 5ml';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  VALUES ('Mercedes club Black men - Decant 5ml', 10000, 10000, 10, 'decant', 'decant', true, v_img, COALESCE(v_add_imgs, ARRAY[]::TEXT[]), v_filter_spec);
  RAISE NOTICE '✅ 10/17 Mercedes club Black men';

  -- ================================================================
  -- 11) one millón Privé - $16.500
  -- ================================================================
  SELECT image INTO v_img FROM products WHERE name ILIKE '%mill_n%Priv%' AND name NOT ILIKE '%decant%' LIMIT 1;
  IF v_img IS NULL THEN SELECT image INTO v_img FROM products WHERE name ILIKE '%one million%' AND name NOT ILIKE '%decant%' LIMIT 1; END IF;
  IF v_img IS NULL THEN SELECT image INTO v_img FROM products WHERE name ILIKE '%1 million%' AND name NOT ILIKE '%decant%' LIMIT 1; END IF;
  SELECT additional_images INTO v_add_imgs FROM products WHERE name ILIKE '%mill_n%Priv%' AND name NOT ILIKE '%decant%' LIMIT 1;

  DELETE FROM products WHERE name = 'one millón Privé - Decant 5ml';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  VALUES ('one millón Privé - Decant 5ml', 16500, 16500, 10, 'decant', 'decant', true, v_img, COALESCE(v_add_imgs, ARRAY[]::TEXT[]), v_filter_spec);
  RAISE NOTICE '✅ 11/17 one millón Privé';

  -- ================================================================
  -- 12) le male elixir - $13.500
  -- ================================================================
  SELECT image INTO v_img FROM products WHERE name ILIKE '%le male%elixir%' AND name NOT ILIKE '%decant%' LIMIT 1;
  IF v_img IS NULL THEN SELECT image INTO v_img FROM products WHERE name ILIKE '%le male%' AND name NOT ILIKE '%decant%' LIMIT 1; END IF;
  SELECT additional_images INTO v_add_imgs FROM products WHERE name ILIKE '%le male%elixir%' AND name NOT ILIKE '%decant%' LIMIT 1;

  DELETE FROM products WHERE name = 'le male elixir - Decant 5ml';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  VALUES ('le male elixir - Decant 5ml', 13500, 13500, 10, 'decant', 'decant', true, v_img, COALESCE(v_add_imgs, ARRAY[]::TEXT[]), v_filter_spec);
  RAISE NOTICE '✅ 12/17 le male elixir';

  -- ================================================================
  -- 13) Amber oud gold edition - $10.000
  -- ================================================================
  SELECT image INTO v_img FROM products WHERE name ILIKE '%Amber%oud%gold%' AND name NOT ILIKE '%decant%' LIMIT 1;
  IF v_img IS NULL THEN SELECT image INTO v_img FROM products WHERE name ILIKE '%Amber%gold%' AND name NOT ILIKE '%decant%' LIMIT 1; END IF;
  SELECT additional_images INTO v_add_imgs FROM products WHERE name ILIKE '%Amber%oud%gold%' AND name NOT ILIKE '%decant%' LIMIT 1;

  DELETE FROM products WHERE name = 'Amber oud gold edition - Decant 5ml';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  VALUES ('Amber oud gold edition - Decant 5ml', 10000, 10000, 10, 'decant', 'decant', true, v_img, COALESCE(v_add_imgs, ARRAY[]::TEXT[]), v_filter_spec);
  RAISE NOTICE '✅ 13/17 Amber oud gold edition';

  -- ================================================================
  -- 14) Chanel Allure Homme Sport Extreme - $20.000
  -- ================================================================
  SELECT image INTO v_img FROM products WHERE name ILIKE '%Allure%Homme%Sport%Extreme%' AND name NOT ILIKE '%decant%' LIMIT 1;
  IF v_img IS NULL THEN SELECT image INTO v_img FROM products WHERE name ILIKE '%Allure%Sport%' AND name NOT ILIKE '%decant%' LIMIT 1; END IF;
  IF v_img IS NULL THEN SELECT image INTO v_img FROM products WHERE name ILIKE '%Allure%' AND name NOT ILIKE '%decant%' LIMIT 1; END IF;
  SELECT additional_images INTO v_add_imgs FROM products WHERE name ILIKE '%Allure%Homme%Sport%Extreme%' AND name NOT ILIKE '%decant%' LIMIT 1;

  DELETE FROM products WHERE name = 'Chanel Allure Homme Sport Extreme - Decant 5ml';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  VALUES ('Chanel Allure Homme Sport Extreme - Decant 5ml', 20000, 20000, 10, 'decant', 'decant', true, v_img, COALESCE(v_add_imgs, ARRAY[]::TEXT[]), v_filter_spec);
  RAISE NOTICE '✅ 14/17 Chanel Allure Homme Sport Extreme';

  -- ================================================================
  -- 15) Prada ocean edt - $13.500
  -- ================================================================
  SELECT image INTO v_img FROM products WHERE name ILIKE '%Prada%ocean%' AND name NOT ILIKE '%decant%' LIMIT 1;
  IF v_img IS NULL THEN SELECT image INTO v_img FROM products WHERE name ILIKE '%Prada%' AND name NOT ILIKE '%decant%' LIMIT 1; END IF;
  SELECT additional_images INTO v_add_imgs FROM products WHERE name ILIKE '%Prada%ocean%' AND name NOT ILIKE '%decant%' LIMIT 1;

  DELETE FROM products WHERE name = 'Prada ocean edt - Decant 5ml';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  VALUES ('Prada ocean edt - Decant 5ml', 13500, 13500, 10, 'decant', 'decant', true, v_img, COALESCE(v_add_imgs, ARRAY[]::TEXT[]), v_filter_spec);
  RAISE NOTICE '✅ 15/17 Prada ocean edt';

  -- ================================================================
  -- 16) Valentino Born in Roma intense - $16.500
  -- ================================================================
  SELECT image INTO v_img FROM products WHERE name ILIKE '%Valentino%Born%Roma%intense%' AND name NOT ILIKE '%decant%' LIMIT 1;
  IF v_img IS NULL THEN SELECT image INTO v_img FROM products WHERE name ILIKE '%Born%Roma%' AND name NOT ILIKE '%decant%' LIMIT 1; END IF;
  IF v_img IS NULL THEN SELECT image INTO v_img FROM products WHERE name ILIKE '%Valentino%' AND name NOT ILIKE '%decant%' LIMIT 1; END IF;
  SELECT additional_images INTO v_add_imgs FROM products WHERE name ILIKE '%Valentino%Born%Roma%intense%' AND name NOT ILIKE '%decant%' LIMIT 1;

  DELETE FROM products WHERE name = 'Valentino Born in Roma intense - Decant 5ml';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  VALUES ('Valentino Born in Roma intense - Decant 5ml', 16500, 16500, 10, 'decant', 'decant', true, v_img, COALESCE(v_add_imgs, ARRAY[]::TEXT[]), v_filter_spec);
  RAISE NOTICE '✅ 16/17 Valentino Born in Roma intense';

  -- ================================================================
  -- 17) Rayhaan Crimson - $8.000
  -- ================================================================
  SELECT image INTO v_img FROM products WHERE name ILIKE '%Crimson%' AND name NOT ILIKE '%decant%' LIMIT 1;
  SELECT additional_images INTO v_add_imgs FROM products WHERE name ILIKE '%Crimson%' AND name NOT ILIKE '%decant%' LIMIT 1;

  DELETE FROM products WHERE name = 'Rayhaan Crimson - Decant 5ml';
  INSERT INTO products (name, price, original_price, stock, category, category_name, is_published, image, additional_images, specifications)
  VALUES ('Rayhaan Crimson - Decant 5ml', 8000, 8000, 10, 'decant', 'decant', true, v_img, COALESCE(v_add_imgs, ARRAY[]::TEXT[]), v_filter_spec);
  RAISE NOTICE '✅ 17/17 Rayhaan Crimson';

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ 17 productos Decant 5ml insertados!';
  RAISE NOTICE '========================================';
END $$;

-- ========== PASO 3: Limpiar versiones anteriores "Decant 5ML" (mayúsculas) si existen ==========
-- Esto elimina duplicados de scripts anteriores que usaban "Decant 5ML" en vez de "Decant 5ml"
DELETE FROM products WHERE name ILIKE '% - Decant 5ML' AND name NOT ILIKE '% - Decant 5ml';

-- ========== PASO 4: Verificación ==========

-- Ver los productos creados
SELECT name, price, 
  CASE WHEN image IS NOT NULL THEN '✅ Tiene imagen' ELSE '❌ Sin imagen' END as imagen
FROM products 
WHERE name ILIKE '%Decant 5ml%'
ORDER BY name;

-- Ver las opciones del filtro "Tipo"
SELECT fo.name, fo."order"
FROM filter_options fo
JOIN filters f ON fo.parent_id = f.id
WHERE f.name = 'Tipo'
ORDER BY fo."order";
