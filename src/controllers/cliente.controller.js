//cliente.controller.js
import { pool } from "../db.js";

// Traer todos los clientes
export const obtenerClientes = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM cliente ORDER BY id_cliente ASC");
    res.json(result.rows); // Devuelve todos los clientes
  } catch (error) {
    console.error("❌ Error al obtener clientes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Buscar cliente por dato_cliente o dni_cuit
export const buscarCliente = async (req, res) => {
  const { termino } = req.query;

  if (!termino) {
    return res.status(400).json({ error: "Debes enviar un término de búsqueda" });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM cliente 
       WHERE dato_cliente ILIKE $1 OR dni_cuit ILIKE $1`,
      [`%${termino}%`]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    res.status(200).json(result.rows); // Devuelve los clientes encontrados
  } catch (error) {
    console.error("❌ Error al buscar cliente:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
