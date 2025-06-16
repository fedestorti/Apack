// crearTablas.js
import { pool } from './db.js';

const crearTablas = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS usuarios (
      id           SERIAL PRIMARY KEY,
      nombre       TEXT      NOT NULL,
      apellido     TEXT      NOT NULL,
      email        TEXT      NOT NULL UNIQUE,
      contraseña   TEXT      NOT NULL
    );

    CREATE TABLE IF NOT EXISTS productos (
      id               SERIAL PRIMARY KEY,
      codigo_producto  TEXT      NOT NULL UNIQUE,
      nombre_producto  TEXT      NOT NULL,
      precio           NUMERIC(12,2) NOT NULL CHECK (precio >= 0),
      imagen           TEXT,
      fecha_registro   TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
    );
  `;

  try {
    await pool.query(query);
    console.log('✅ Tablas creadas correctamente');
  } catch (err) {
    console.error('❌ Error al crear las tablas:', err);
  } finally {
    pool.end();
  }
};

crearTablas();
