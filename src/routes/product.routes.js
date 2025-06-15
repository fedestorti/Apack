// routes/product.routes.js
import { Router } from 'express';
import { verificarToken } from '../middlewares/verificarToken.js';
import upload from '../middlewares/multer.js';
import { productosController } from '../controllers/productosController.js';
import { verificarAdmin } from '../middlewares/verificarAdmin.js';
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
router.delete('/:codigo', verificarToken, verificarAdmin, async (req, res) => {
  const { codigo } = req.params;
  // 1. Busca producto y su imagen
  const producto = await Producto.findOne({ where: { codigo_producto: codigo } });
  if (!producto) return res.sendStatus(404);

  // 2. Elimina archivo del disco
  const imagePath = path.join(__dirname, '../../imagenesProductos', producto.imagen);
  try { await fs.promises.unlink(imagePath); } catch (err) { /* si no existe, ignora */ }

  // 3. Elimina registro en la BD
  await producto.destroy();
  res.sendStatus(200);
});

export default router;
