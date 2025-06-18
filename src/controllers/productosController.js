// productosController.js
import { pool } from '../db.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    if (!codigo_producto || !nombre_producto || !precio) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Imagen es requerida' });
    }

    // 🔒 Validaciones opcionales
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'Solo se permiten archivos de imagen' });
    }

    if (req.file.size > 2 * 1024 * 1024) { // 2 MB
      return res.status(400).json({ message: 'La imagen excede el tamaño máximo de 2MB' });
    }
    const codigo = codigo_producto.trim().toLowerCase();

    // Verificar si ya existe el producto
    const dup = await pool.query(
      'SELECT 1 FROM productos WHERE LOWER(TRIM(codigo_producto)) = $1',
      [codigo]
    );
    if (dup.rowCount) {
      return res.status(409).json({ message: 'El código de producto ya existe' });
    }

    // URL pública de Cloudinary
    const urlImagen = req.file.path;

    // Insertar en la base de datos
    const { rows } = await pool.query(
      `INSERT INTO productos (codigo_producto, nombre_producto, precio, imagen)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [codigo_producto, nombre_producto, precio, urlImagen]
    );

    res.status(201).json({
      message: '✅ Producto registrado correctamente',
      producto: rows[0]
    });

  } catch (err) {
    console.error('❌ Error al registrar producto:', err);
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
    let   newImage = existente.imagen;
    let   newPublicId = existente.public_id;

    if (req.file) {

    // 🔒 Validaciones de tipo y tamaño
      if (!req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({ message: 'Solo se permiten archivos de imagen' });
      }
    
      if (req.file.size > 2 * 1024 * 1024) {
        return res.status(400).json({ message: 'La imagen excede el tamaño máximo de 2MB' });
      }

    // 🧹 Borrar imagen anterior de Cloudinary si existe
      if (existente.public_id) {
        try {
          await cloudinary.uploader.destroy(existente.public_id);
        } catch (e) {
          console.warn('⚠️ No se pudo borrar la imagen anterior en Cloudinary:', e.message);
        }
      }

    // 🆕 Subir nueva imagen
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      const uploadResult = await cloudinary.uploader.upload(dataURI);

      newImage = uploadResult.secure_url;
      newPublicId = uploadResult.public_id;
    }

    // Construcción dinámica del SET
    const setClauses = [];
    const vals = [];
    let idx = 1;

    if (nombre_producto != null) {
      setClauses.push(`nombre_producto = $${idx}`);
      vals.push(newName);
      idx++;
    }

    if (precio != null) {
      setClauses.push(`precio = $${idx}`);
      vals.push(newPrice);
      idx++;
    }

    if (req.file) {
      setClauses.push(`imagen = $${idx}`);
      vals.push(newImage);
      idx++;

      setClauses.push(`public_id = $${idx}`);
      vals.push(newPublicId);
      idx++;
    }

    vals.push(codigo.trim());
    const sql = `
      UPDATE productos
         SET ${setClauses.join(', ')}
       WHERE LOWER(TRIM(codigo_producto)) = LOWER($${idx})
       RETURNING *;
    `;

    const { rows } = await pool.query(sql, vals);

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

    // Buscar el producto para obtener el public_id
    const { rows } = await pool.query(
      'SELECT public_id FROM productos WHERE LOWER(TRIM(codigo_producto)) = LOWER($1)',
      [codigo]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const { public_id } = rows[0];

    // Borrar la imagen de Cloudinary si tiene public_id
    if (public_id) {
      try {
        await cloudinary.uploader.destroy(public_id);
      } catch (e) {
        console.warn('⚠️ No se pudo eliminar la imagen en Cloudinary:', e.message);
      }
    }

    // Borrar el producto de la base de datos
    await pool.query(
      'DELETE FROM productos WHERE LOWER(TRIM(codigo_producto)) = LOWER($1)',
      [codigo]
    );

    return res.json({ message: 'Producto e imagen eliminados correctamente' });

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
