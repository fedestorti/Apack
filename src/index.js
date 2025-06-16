import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bcrypt from 'bcrypt';

import authRoutes from './routes/auth.routes.js';
import productosRoutes from './routes/product.routes.js';
import imagenesRoutes from './routes/imagenes.routes.js';
import { pool } from './db.js';

if (!process.env.JWT_SECRET) {
  console.error('❌ Falta JWT_SECRET en el .env');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 4000;

// ------------ Middlewares ------------ //
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ------------ Rutas API ------------- //
app.use('/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/imagenes', imagenesRoutes);

// ------------ Ruta temporal para insertar usuario ------------ //
app.get('/crear-usuario-prueba', async (_req, res) => {
  try {
    const hash = await bcrypt.hash('@pack2025', 10);
    await pool.query(`
      INSERT INTO usuarios (nombre, apellido, email, contraseña)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, ['Pablo', 'Acosta', 'Pablo.Acosta@gmail.com', hash]);

    res.send('✅ Usuario insertado correctamente');
  } catch (err) {
    console.error('❌ Error al insertar usuario:', err);
    res.status(500).send('Error al insertar usuario');
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
    return next(); // permitir archivos estáticos
  }
  res.sendFile(path.join(publicDir, 'Usuarios', 'index.html'));
});

// ------------ Iniciar servidor ------------ //
app.listen(PORT, () => {
  console.log(`✅ API escuchando en http://localhost:${PORT}`);
});
