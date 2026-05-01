import XLSX from 'xlsx';
import fs from 'fs';
import google from 'googlethis';

const categoryId = 'a1daf51c-db9e-4d7b-9dcc-d4f8c2ea6afd';
const delay = ms => new Promise(res => setTimeout(res, ms));

async function run() {
  console.log('Leyendo excel...');
  const workbook = XLSX.readFile('c:/Users/Usuario/Documents/proyecto perfumes/excel/visfumarabes.xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, {header: 1});

  let sql = `-- Script para insertar perfumes árabes CON IMAGENES
-- Categoria ID para "Arabe": ${categoryId}

INSERT INTO products (name, category_id, category, price, original_price, cost, stock, is_published, is_offer, description, image) VALUES
`;

  const values = [];
  let added = 0;
  
  // Limitar la cantidad para evitar bloqueos si el usuario quiere partes.
  // Pero lo intentaremos con todos con un delay.
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row && row[1]) {
      let rawName = String(row[1]).trim();
      if (!rawName || rawName === 'null') continue;
      
      let name = rawName.replace(/\s+/g, ' ');
      let searchName = name.replace(/\(\d+\)/g, '').trim() + ' perfume'; // Remove numbers in parenthesis for better search

      let imageUrl = 'NULL';
      
      try {
        console.log(`[${added+1}] Buscando: ${searchName}`);
        const images = await google.image(searchName, { safe: false });
        if (images && images.length > 0) {
          imageUrl = `'${images[0].url.replace(/'/g, "''")}'`;
          console.log(`  -> Encontrada: ${images[0].url.substring(0, 60)}...`);
        } else {
          console.log(`  -> Sin imagen`);
        }
      } catch (e) {
        console.log(`  -> Error buscando imagen: ${e.message}`);
      }

      let escapedName = name.replace(/'/g, "''");
      values.push(`('${escapedName}', '${categoryId}', '${categoryId}', 0, 0, 0, 0, false, false, 'Descripción pendiente', ${imageUrl})`);
      added++;
      
      // Escribir incrementalmente para no perder datos si falla
      fs.writeFileSync('c:/Users/Usuario/Documents/proyecto perfumes/insert_arabes_imagenes.sql', sql + values.join(',\n') + ';\n');
      
      await delay(1500); // 1.5 seconds delay to prevent blocking
    }
  }
  
  console.log(`¡Proceso terminado! Se generó insert_arabes_imagenes.sql con ${added} productos.`);
}

run();
