-- ============================================
-- FILTROS PARA TIENDA DE PERFUMES / DECANTS - VISFUM
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Primero, limpiar filtros y opciones existentes (si los hay)
DELETE FROM filter_options;
DELETE FROM filters;

-- ============================================
-- 1. FILTRO: Tipo de Producto
-- ============================================
INSERT INTO filters (name, "order") VALUES ('Tipo de Producto', 0);

INSERT INTO filter_options (name, parent_id, "order")
SELECT opt.name, f.id, opt.ord
FROM filters f,
(VALUES 
  ('Decant', 0),
  ('Sellado', 1),
  ('Miniatura', 2),
  ('Set / Cofre', 3)
) AS opt(name, ord)
WHERE f.name = 'Tipo de Producto';

-- ============================================
-- 2. FILTRO: Mililitros (para decants)
-- ============================================
INSERT INTO filters (name, "order") VALUES ('Mililitros', 1);

INSERT INTO filter_options (name, parent_id, "order")
SELECT opt.name, f.id, opt.ord
FROM filters f,
(VALUES 
  ('2.5 ml', 0),
  ('5 ml', 1),
  ('10 ml', 2),
  ('15 ml', 3),
  ('30 ml', 4),
  ('50 ml', 5),
  ('100 ml', 6),
  ('125 ml', 7),
  ('200 ml', 8)
) AS opt(name, ord)
WHERE f.name = 'Mililitros';

-- ============================================
-- 3. FILTRO: Género
-- ============================================
INSERT INTO filters (name, "order") VALUES ('Género', 2);

INSERT INTO filter_options (name, parent_id, "order")
SELECT opt.name, f.id, opt.ord
FROM filters f,
(VALUES 
  ('Masculino', 0),
  ('Femenino', 1),
  ('Unisex', 2)
) AS opt(name, ord)
WHERE f.name = 'Género';

-- ============================================
-- 4. FILTRO: Concentración
-- ============================================
INSERT INTO filters (name, "order") VALUES ('Concentración', 3);

INSERT INTO filter_options (name, parent_id, "order")
SELECT opt.name, f.id, opt.ord
FROM filters f,
(VALUES 
  ('Eau de Toilette (EDT)', 0),
  ('Eau de Parfum (EDP)', 1),
  ('Parfum / Extrait', 2),
  ('Eau de Cologne (EDC)', 3),
  ('Eau Fraîche', 4)
) AS opt(name, ord)
WHERE f.name = 'Concentración';

-- ============================================
-- 5. FILTRO: Familia Olfativa
-- ============================================
INSERT INTO filters (name, "order") VALUES ('Familia Olfativa', 4);

INSERT INTO filter_options (name, parent_id, "order")
SELECT opt.name, f.id, opt.ord
FROM filters f,
(VALUES 
  ('Amaderado', 0),
  ('Cítrico', 1),
  ('Floral', 2),
  ('Oriental / Especiado', 3),
  ('Dulce / Gourmand', 4),
  ('Fresco / Acuático', 5),
  ('Aromático', 6),
  ('Chipre / Cuero', 7),
  ('Oud / Ahumado', 8),
  ('Fougère', 9)
) AS opt(name, ord)
WHERE f.name = 'Familia Olfativa';

-- ============================================
-- 6. FILTRO: Marca
-- ============================================
INSERT INTO filters (name, "order") VALUES ('Marca', 5);

INSERT INTO filter_options (name, parent_id, "order")
SELECT opt.name, f.id, opt.ord
FROM filters f,
(VALUES 
  ('Dior', 0),
  ('Chanel', 1),
  ('Tom Ford', 2),
  ('Versace', 3),
  ('Carolina Herrera', 4),
  ('Paco Rabanne', 5),
  ('Jean Paul Gaultier', 6),
  ('YSL (Yves Saint Laurent)', 7),
  ('Dolce & Gabbana', 8),
  ('Armani', 9),
  ('Creed', 10),
  ('Montblanc', 11),
  ('Hugo Boss', 12),
  ('Lattafa', 13),
  ('Afnan', 14),
  ('Maison Francis Kurkdjian', 15),
  ('Nishane', 16),
  ('Xerjoff', 17),
  ('Parfums de Marly', 18),
  ('Otro', 19)
) AS opt(name, ord)
WHERE f.name = 'Marca';

-- ============================================
-- 7. FILTRO: Ocasión
-- ============================================
INSERT INTO filters (name, "order") VALUES ('Ocasión', 6);

INSERT INTO filter_options (name, parent_id, "order")
SELECT opt.name, f.id, opt.ord
FROM filters f,
(VALUES 
  ('Uso diario', 0),
  ('Oficina / Trabajo', 1),
  ('Salida nocturna', 2),
  ('Cita romántica', 3),
  ('Evento formal', 4),
  ('Casual / Verano', 5)
) AS opt(name, ord)
WHERE f.name = 'Ocasión';

-- ============================================
-- 8. FILTRO: Estación
-- ============================================
INSERT INTO filters (name, "order") VALUES ('Estación', 7);

INSERT INTO filter_options (name, parent_id, "order")
SELECT opt.name, f.id, opt.ord
FROM filters f,
(VALUES 
  ('Primavera', 0),
  ('Verano', 1),
  ('Otoño', 2),
  ('Invierno', 3),
  ('Todas las estaciones', 4)
) AS opt(name, ord)
WHERE f.name = 'Estación';
