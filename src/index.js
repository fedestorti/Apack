// index.js
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors';
import imagenesRoutes from './routes/imagenes.routes.js';
import productosRoutes from './routes/product.routes.js';
import authRoutes from './routes/auth.routes.js';

dotenv.config();
if (!process.env.JWT_SECRET) {
  console.error('❌ Falta JWT_SECRET en el .env');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(cors());

 // rutas “protegidas” u ofc:
app.use('/auth', authRoutes);
app.use('/api/productos', productosRoutes);



 // directorio estático donde Multer deja los archivos
app.use('/imagenesProductos',
  express.static(path.join(__dirname, '../imagenesProductos'))
);

// Rutas para la galería pública
app.use('/api/imagenes', imagenesRoutes);


app.listen(PORT, () => {
  console.log(`✅ API escuchando en http://localhost:${PORT}`);
});
