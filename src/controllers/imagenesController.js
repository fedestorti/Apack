// src/controllers/imagenesController.js
import { pool } from '../db.js'; // tu pool de PostgreSQL


export const imagenesController = {
  // GET /api/imagenes
  getAllImagenes: async (req, res) => {
    try {
      // Traemos los campos que necesitemos
      const result = await pool.query(`
        SELECT 
          codigo_producto, 
          nombre_producto, 
          precio, 
          imagen
        FROM productos
      `);

      // Mapear para incluir la URL pública de la imagen
      const productos = result.rows.map(p => ({
        codigo:   p.codigo_producto,
        nombre:   p.nombre_producto,
        precio:   p.precio,
        imagen: `${req.protocol}://${req.get('host')}${p.imagen}`
      }));

      return res.json(productos);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error al obtener imágenes' });
    }
  }
};
