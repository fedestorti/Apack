// src/controllers/transacciones.controller.js
import pool from '../db.js'; // tu pool/cliente de pg

export const registrarTransaccion = async (req, res) => {
  const { id_producto, cantidad, precio_unitario } = req.body;
  const client = await pool.connect();

  try {
    // 1) Verificar stock
    const { rows } = await client.query(
      'SELECT stock FROM productos WHERE id_producto = $1 FOR UPDATE',
      [id_producto]
    );
    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Producto no encontrado' });
    }
    const stockActual = rows[0].stock;
    if (stockActual < cantidad) {
      return res.status(400).json({ msg: 'Stock insuficiente' });
    }

    // 2) Iniciar transacción
    await client.query('BEGIN');

    // 3) Insertar transacción
    const insertText = `
      INSERT INTO transacciones (id_producto, cantidad, precio_unitario)
      VALUES ($1, $2, $3) RETURNING *`;
    const insertValues = [id_producto, cantidad, precio_unitario];
    const result = await client.query(insertText, insertValues);

    // 4) Actualizar stock
    const updateText = `
      UPDATE productos
      SET stock = stock - $1
      WHERE id_producto = $2`;
    await client.query(updateText, [cantidad, id_producto]);

    // 5) Commit
    await client.query('COMMIT');

    res.status(201).json({ 
      msg: 'Transacción registrada',
      transaccion: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ msg: 'Error interno al registrar la transacción' });
  } finally {
    client.release();
  }
};
