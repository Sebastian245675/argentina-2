-- Deshabilitar temporalmente RLS para permitir la inserción libre de contactos desde React
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;

-- Asegurarse de que si se rehabilita, tengamos una política para inserciones anónimas
CREATE POLICY "Permitir inserciones anónimas en contacts"
ON contacts
FOR INSERT
WITH CHECK (true);

-- Permitir también selects para que se puedan ver en la lista
CREATE POLICY "Permitir lecturas públicas de contacts"
ON contacts
FOR SELECT
USING (true);
