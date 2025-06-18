// src/controllers/imagenesController.js
import { pool } from '../db.js'; // tu pool de PostgreSQL


export const imagenesController = {
  // GET /api/imagenes
  getAllImagenes: async (_req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          codigo_producto, 
          nombre_producto, 
          precio, 
          imagen
        FROM productos
      `);

      const productos = result.rows.map(p => ({
        codigo: p.codigo_producto,
        nombre: p.nombre_producto,
        precio: p.precio,
        imagen: p.imagen // ya es una URL completa de Cloudinary
      }));

      return res.json(productos);
    } catch (err) {
      console.error('❌ Error al obtener imágenes:', err);
      return res.status(500).json({ message: 'Error al obtener imágenes' });
    }
  }
};