// src/middlewares/multer.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Directorio absoluto donde guardamos las imágenes
const uploadDir = path.join(__dirname, '../../imagenesProductos');

// Asegurarnos de que el directorio de imágenes existe antes de procesar la carga
const ensureDirectoryExistence = dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Verificar y crear el directorio antes de subir la imagen
    ensureDirectoryExistence(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generamos un nombre de archivo único
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);  // Obtener la extensión del archivo
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Configurar Multer
const upload = multer({ storage });

export default upload;
