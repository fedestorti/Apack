// src/routes/transacciones.routes.js
import { Router } from 'express';
import { registrarTransaccion } from '../controllers/transacciones.controller.js';
import { validarJWT } from '../middlewares/auth.js';

const router = Router();

router.post('/', validarJWT, registrarTransaccion);

export default router;