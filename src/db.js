// src/db.js
import dotenv from 'dotenv';
dotenv.config();  // carga .env antes que nada

import { Pool } from 'pg';

const isProd = process.env.NODE_ENV === 'production';

// Para depurar al arrancar:
console.log('🔌 DB › DATABASE_URL =', process.env.DATABASE_URL);
console.log('🔌 DB › SSL en producción?', isProd);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProd
    ? { rejectUnauthorized: false }  // en prod, si tu hosting lo requiere
    : false                          // en dev, SIN SSL (evita el “server does not support SSL”)
});