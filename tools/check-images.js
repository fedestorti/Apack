import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

/* --- resolver directorios en ESM --- */
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

/* carpeta de imágenes, relativa al proyecto raíz */
const imgDir = path.resolve(__dirname, '../imagenesProductos');

/* conexión PG */
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/* consulta filas que tienen imagen */
const { rows } = await pool.query(
  'SELECT codigo_producto, imagen FROM productos WHERE imagen IS NOT NULL'
);

console.log(`Revisando ${rows.length} registros…\n`);

for (const p of rows) {
  const file = path.join(imgDir, p.imagen);
  const ok   = await fs.access(file).then(() => true).catch(() => false);
  if (!ok) console.log(`⚠️  Producto ${p.codigo_producto}: falta ${p.imagen}`);
}

await pool.end();
