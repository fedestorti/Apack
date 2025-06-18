// src/controllers/imagenesController.js
import { pool } from '../db.js'; // tu pool de PostgreSQL


export const imagenesController = {
  getAllImagenes: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT codigo_producto, nombre_producto, precio FROM productos
      `);

      const productos = result.rows.map(p => ({
        codigo: p.codigo_producto,
        nombre: p.nombre_producto,
        precio: p.precio,
        imagen: `${req.protocol}://${req.get('host')}/api/imagenes/${p.codigo_producto}`
      }));

      return res.json(productos);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error al obtener imágenes' });
    }
  }
};
