-- ============================================
-- SOLUCIÓN PARA ERROR 403 - PERMISOS
-- ============================================

-- 1. Otorgar permisos a los roles de Supabase
GRANT ALL ON public.filters TO anon, authenticated, service_role;
GRANT ALL ON public.filter_options TO anon, authenticated, service_role;

-- 2. Otorgar permisos en las secuencias (si existen)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 3. Verificar las políticas actuales
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('filters', 'filter_options')
ORDER BY tablename, policyname;

-- 4. Eliminar políticas restrictivas y crear nuevas más permisivas
DROP POLICY IF EXISTS "Administradores pueden insertar opciones de filtros" ON public.filter_options;
DROP POLICY IF EXISTS "Administradores pueden actualizar opciones de filtros" ON public.filter_options;
DROP POLICY IF EXISTS "Administradores pueden eliminar opciones de filtros" ON public.filter_options;

-- 5. Crear políticas más simples para filter_options
CREATE POLICY "Todos pueden insertar opciones de filtros" 
ON public.filter_options FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Todos pueden actualizar opciones de filtros" 
ON public.filter_options FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Todos pueden eliminar opciones de filtros" 
ON public.filter_options FOR DELETE 
TO authenticated
USING (true);

-- 6. Hacer lo mismo con filters
DROP POLICY IF EXISTS "Administradores pueden insertar filtros" ON public.filters;
DROP POLICY IF EXISTS "Administradores pueden actualizar filtros" ON public.filters;
DROP POLICY IF EXISTS "Administradores pueden eliminar filtros" ON public.filters;

CREATE POLICY "Todos pueden insertar filtros" 
ON public.filters FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Todos pueden actualizar filtros" 
ON public.filters FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Todos pueden eliminar filtros" 
ON public.filters FOR DELETE 
TO authenticated
USING (true);

-- 7. Verificar que las políticas se aplicaron correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('filters', 'filter_options')
ORDER BY tablename, cmd;

-- 8. Probar inserción directa
-- Descomenta y ejecuta esto si quieres probar manualmente:
-- INSERT INTO public.filter_options (name, parent_id, "order") 
-- SELECT '2.5ml', id, 0 
-- FROM public.filters 
-- WHERE name = 'Mililitros' 
-- LIMIT 1;

-- 9. Verificar los datos
SELECT 
    f.name as filtro,
    COUNT(fo.id) as num_opciones
FROM public.filters f
LEFT JOIN public.filter_options fo ON fo.parent_id = f.id
GROUP BY f.id, f.name
ORDER BY f."order";
