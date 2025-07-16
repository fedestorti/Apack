// routes/product.routes.js
import { Router } from 'express';
import { verificarToken } from '../middlewares/verificarToken.js';
import upload from '../middlewares/upload.js';
import { productosController } from '../controllers/productosController.js';
const router = Router();
// GET todos los productos
router.get('/', verificarToken, productosController.getAllProductos);

// POST registrar producto
router.post(
  '/',
  verificarToken,
  upload.single('imagen'),
  productosController.registrarProducto
);

// PUT actualizar producto por código
router.put(
  '/:codigo',
  verificarToken,
  upload.single('imagen'),
  productosController.actualizarProducto
);

// DELETE producto por código
router.delete('/:codigo',
  verificarToken,
  productosController.eliminarProducto
);

export default router;
