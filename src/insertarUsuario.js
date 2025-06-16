// insertarUsuario.js
import { pool } from './db.js';
import bcrypt from 'bcrypt';

const insertarUsuario = async () => {
  const nombre     = 'Pablo';
  const apellido   = 'Acosta';
  const email      = 'Pablo.Acosta@gmail.com';
  const contraseña = '@pack2025';

  try {
    // Hashear la contraseña
    const hash = await bcrypt.hash(contraseña, 10);

    // Insertar usuario
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, email, contraseña)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING
       RETURNING *`,
      [nombre, apellido, email, hash]
    );

    if (result.rows.length) {
      console.log('✅ Usuario insertado:', result.rows[0]);
    } else {
      console.log('ℹ️ El usuario ya existe. No se insertó nuevamente.');
    }
  } catch (err) {
    console.error('❌ Error al insertar usuario:', err);
  } finally {
    pool.end();
  }
};

insertarUsuario();
