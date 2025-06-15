// index.js
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';
import imagenesRoutes from './routes/imagenes.routes.js';
import productosRoutes from './routes/product.routes.js';
import authRoutes from './routes/auth.routes.js';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

dotenv.config();




if (!process.env.JWT_SECRET) {
  console.error('❌ Falta JWT_SECRET en el .env');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const __root = path.resolve();  
const usuariosDir = path.join(__root,'Usuarios');
app.use(express.static(usuariosDir));
// Archivos públicos
app.use(express.static(path.join(__root, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// 1. Middlewares globales
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
// Middlewares globales (antes de las rutas)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);
app.use(compression());

// 2. Rutas API
app.use('/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/imagenes', imagenesRoutes);


// 3. Archivos estáticos de Usuarios (galería pública)
app.get('/', (req, res) => {
  res.sendFile(path.resolve('public', 'Usuarios', 'index.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve('public', 'Usuarios', 'index.html'));
});

// 4. Archivos Multer (sólo si es correcto exponerlos)
app.use('/imagenesProductos',
  express.static(path.join(__dirname, '../imagenesProductos'))
);

// --- Health-check -------------------------------------------------
app.get('/api/ping', (req, res) => res.json({ status: 'ok' }));
app.listen(PORT, () => {
  console.log(`✅ API escuchando en http://localhost:${PORT}`);
});
