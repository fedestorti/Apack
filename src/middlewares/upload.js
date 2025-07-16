// src/middlewares/upload.js
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

// Configurar Cloudinary con tus credenciales
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Almacenar imágenes en carpeta 'apack'
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'apack', // 📁 Carpeta donde se guardarán
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 800, crop: 'limit' }],
  },
});

// Middleware listo para usar en rutas
const upload = multer({ storage });

export default upload;
