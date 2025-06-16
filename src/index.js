import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
// helmet y compression desactivados temporalmente por compatibilidad

import authRoutes from './routes/auth.routes.js';
import productosRoutes from './routes/product.routes.js';
import imagenesRoutes from './routes/imagenes.routes.js';
import { pool } from './db.js';  // ⬅️ Importá tu conexión a la base de datos

if (!process.env.JWT_SECRET) {
  console.error('❌ Falta JWT_SECRET en el .env');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 4000;

// ------------ Middlewares ------------ //
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// ------------ Rutas API ------------- //
app.use('/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/imagenes', imagenesRoutes);

// ------------ Ruta temporal para crear tablas ------------ //
app.get('/crear-tablas', async (req, res) => {
  try {
    await pool.query(`
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
    `);
    res.send('✅ Tablas creadas exitosamente');
  } catch (err) {
    console.error('❌ Error creando tablas:', err);
    res.status(500).send('Error al crear tablas');
  }
});

// ------------ Archivos estáticos ------------ //
app.use('/imagenesProductos', express.static(path.join(__dirname, '../imagenesProductos')));
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));

// ------------ Health check ------------ //
app.get('/api/ping', (_req, res) => res.json({ status: 'ok' }));

// ------------ Catch-all para SPA ------------ //
const extensionesEstaticas = ['.css', '.js', '.jpg', '.jpeg', '.png', '.webp', '.svg', '.ico', '.woff2', '.ttf'];
app.use((req, res, next) => {
  const ext = path.extname(req.path);
  if (extensionesEstaticas.includes(ext)) {
    return next();
  }
  res.sendFile(path.join(publicDir, 'Usuarios', 'index.html'));
});

// ------------ Iniciar servidor ------------ //
app.listen(PORT, () => {
  console.log(`✅ API escuchando en http://localhost:${PORT}`);
});
