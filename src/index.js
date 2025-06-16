// src/index.js
import dotenv from 'dotenv';
dotenv.config();  // carga variables de entorno

import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

import authRoutes from './routes/auth.routes.js';
import productosRoutes from './routes/product.routes.js';
import imagenesRoutes from './routes/imagenes.routes.js';

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
  origin: '*',  // o pon aquí tu FRONTEND_URL
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }}));
app.use(compression());

// ------------ Rutas API ------------- //
app.use('/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/imagenes', imagenesRoutes);

// --------- Imágenes estáticas ------- //
app.use(
  '/imagenesProductos',
  express.static(path.join(__dirname, '../imagenesProductos'))
);

// ----- Frontend estático (public) ---- //
const publicDir = path.join(__dirname, '../public');


// Si entras a la raíz, sirve Usuarios/index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'Usuarios', 'index.html'));
});

// Para cualquier otra ruta no-API, sirve la página de Usuarios (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'Usuarios', 'index.html'));
});

// -------- Health check -------- //
app.get('/api/ping', (req, res) => res.json({ status: 'ok' }));

// ------- Arrancar servidor ------- //
app.listen(PORT, () => {
  console.log(`✅ API escuchando en http://localhost:${PORT}`);
});
