// productosController.js
import { pool } from '../db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Función para borrar la imagen anterior
const borrarImagenAnterior = (rutaRelativa) => {
  if (!rutaRelativa) return;
  const nombre = path.basename(rutaRelativa);
  const ruta = path.join(__dirname, '../../imagenesProductos', nombre);

  if (fs.existsSync(ruta)) {
    try {
      fs.unlinkSync(ruta);  // Elimina la imagen anterior
    } catch (err) {
      console.error('Error al borrar imagen anterior:', err);
    }
  }
};

// Obtener productos
export const getAllProductos = async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM productos ORDER BY codigo_producto');
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

// Función para registrar un producto
export const registrarProducto = async (req, res) => {
  try {
    const { codigo_producto, nombre_producto, precio } = req.body;
    if (!codigo_producto || !nombre_producto || !precio)
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });

    const codigo = codigo_producto.trim().toLowerCase();
    const dup = await pool.query(
      'SELECT 1 FROM productos WHERE LOWER(TRIM(codigo_producto)) = $1',
      [codigo]
    );
    if (dup.rowCount) {
      if (req.file) fs.unlinkSync(path.join(__dirname, '../../imagenesProductos', req.file.filename));
      return res.status(409).json({ message: 'El código de producto ya existe' });
    }

    if (!req.file) return res.status(400).json({ message: 'Imagen es requerida' });
    const baseURL = `${req.protocol}://${req.get('host')}`;
    const rutaImagen = `${baseURL}/imagenesProductos/${req.file.filename}`;
    const { rows } = await pool.query(
      `INSERT INTO productos (codigo_producto, nombre_producto, precio, imagen)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [codigo_producto, nombre_producto, precio, rutaImagen]
    );
    res.status(201).json({ message: 'Producto registrado', producto: rows[0] });

  } catch (err) {
    console.error('Error al registrar:', err);
    if (req.file) fs.unlinkSync(path.join(__dirname, '../../imagenesProductos', req.file.filename));
    res.status(500).json({ message: 'Error al registrar producto' });
  }
};

// Función para actualizar un producto
export const actualizarProducto = async (req, res) => {
  try {
    const { codigo } = req.params;  // código que viene en la URL
    const { nombre_producto, precio } = req.body;

    // 1) Buscar el producto existente
    const prev = await pool.query(
      'SELECT * FROM productos WHERE LOWER(TRIM(codigo_producto)) = LOWER($1)',
      [codigo.trim()]
    );
    if (!prev.rowCount) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    const existente = prev.rows[0];

    // 2) Determinar los nuevos valores o conservar los antiguos
    const newName  = nombre_producto  != null ? nombre_producto.trim() : existente.nombre_producto;
    const newPrice = precio           != null ? precio : existente.precio;
    let  newImage  = existente.imagen;

    // Si subieron archivo, borramos la anterior y preparamos la ruta nueva
    if (req.file) {
      // elimina la imagen anterior del disco
      await borrarImagenAnterior(existente.imagen);

      newImage = `/imagenesProductos/${req.file.filename}`;
    }

    // 3) Construir dinámicamente el SET según qué campos vengan
    const setClauses = [];
    const vals       = [];
    let   idx        = 1;

    // Solo añadimos la cláusula si el campo vino en el body (o en file)
    if (nombre_producto  != null) { setClauses.push(`nombre_producto = $${idx}`); vals.push(newName);  idx++; }
    if (precio           != null) { setClauses.push(`precio          = $${idx}`); vals.push(newPrice); idx++; }
    if (req.file)                  { setClauses.push(`imagen          = $${idx}`); vals.push(newImage);  idx++; }

    if (!setClauses.length) {
      return res.status(400).json({ message: 'No se enviaron campos para actualizar' });
    }

    // El parámetro final es siempre el código
    vals.push(codigo.trim());
    const sql = `
      UPDATE productos
         SET ${setClauses.join(', ')}
       WHERE LOWER(TRIM(codigo_producto)) = LOWER($${idx})
       RETURNING *;
    `;

    // 4) Ejecutar el UPDATE
    const { rows } = await pool.query(sql, vals);

    // 5) Devolver el producto actualizado
    res.json({ message: 'Producto actualizado', producto: rows[0] });

  } catch (err) {
    console.error('Error al actualizar:', err);
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
};


// Función para eliminar producto (ADMIN)
export const eliminarProducto = async (req, res) => {
  console.log('🏷️ Entré a eliminarProducto para:', req.params.codigo);

  try {
    const { codigo } = req.params;
    const { rows } = await pool.query(
      'SELECT imagen FROM productos WHERE LOWER(TRIM(codigo_producto)) = LOWER($1)',
      [codigo]
    );
    if (!rows.length) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await borrarImagenAnterior(rows[0].imagen);
    await pool.query(
      'DELETE FROM productos WHERE LOWER(TRIM(codigo_producto)) = LOWER($1)',
      [codigo]
    );

    return res.json({ message: 'Producto e imagen eliminados' });
  } catch (err) {
    console.error('Error al eliminar:', err);
    return res.status(500).json({ message: 'Error al eliminar producto' });
  }
};

// Subir imagen sola (opcional)
async function subirImagen(req, res) {
  if (!req.file) return res.status(400).json({ message: 'No se subió imagen' });
  res.status(201).json({
    message: 'Imagen subida',
    ruta: `/imagenesProductos/${req.file.filename}`,
    nombreArchivo: req.file.filename
  });
}

export const productosController = {
  getAllProductos,
  registrarProducto,
  actualizarProducto,
  eliminarProducto,
  subirImagen,
};
