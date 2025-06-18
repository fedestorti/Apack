// src/routes/imagenes.routes.js
import { Router } from 'express';
import { imagenesController } from '../controllers/imagenesController.js';

const router = Router();

// Lista pública de productos con fotos
router.get('/', imagenesController.getAllImagenes);

export default router;
