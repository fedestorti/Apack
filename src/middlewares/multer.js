// src/middlewares/multer.js
import multer from 'multer';

// Almacenamiento en memoria (no en disco)
const storage = multer.memoryStorage();

const upload = multer({ storage });

export default upload;
