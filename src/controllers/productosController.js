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

    if (!req.file)
      return res.status(400).json({ message: 'Imagen es requerida' });

    const codigo = codigo_producto.trim().toLowerCase();

    // Verificar código duplicado
    const dup = await pool.query(
      'SELECT 1 FROM productos WHERE LOWER(TRIM(codigo_producto)) = $1',
      [codigo]
    );
    if (dup.rowCount)
      return res.status(409).json({ message: 'El código de producto ya existe' });

    const imagenBinaria = req.file.buffer;

    const { rows } = await pool.query(
      `INSERT INTO productos (codigo_producto, nombre_producto, precio, imagen)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [codigo_producto, nombre_producto, precio, imagenBinaria]
    );

    res.status(201).json({ message: '✅ Producto registrado', producto: rows[0] });

  } catch (err) {
    console.error('Error al registrar:', err);
    res.status(500).json({ message: 'Error al registrar producto' });
  }
};

// Función para actualizar un producto
export const actualizarProducto = async (req, res) => {
  try {
    const { codigo } = req.params;
    const { nombre_producto, precio } = req.body;

    const prev = await pool.query(
      'SELECT * FROM productos WHERE LOWER(TRIM(codigo_producto)) = LOWER($1)',
      [codigo.trim()]
    );
    if (!prev.rowCount) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const existente = prev.rows[0];

    const newName  = nombre_producto?.trim() ?? existente.nombre_producto;
    const newPrice = precio ?? existente.precio;
    const newImage = req.file?.buffer ?? existente.imagen;

    const { rows } = await pool.query(
      `UPDATE productos SET 
        nombre_producto = $1, 
        precio = $2, 
        imagen = $3
       WHERE LOWER(TRIM(codigo_producto)) = LOWER($4)
       RETURNING *`,
      [newName, newPrice, newImage, codigo.trim()]
    );

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

    return res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar:', err);
    return res.status(500).json({ message: 'Error al eliminar producto' });
  }
};

export const productosController = {
  getAllProductos,
  registrarProducto,
  actualizarProducto,
  eliminarProducto
};
