//cliente.routes.js
import { Router } from "express";
import { obtenerClientes, buscarCliente } from "../controllers/cliente.controller.js";
import { verificarToken } from "../middlewares/verificarToken.js";

const router = Router();

// GET /api/clientes -> lista de todos los clientes (requiere token)
router.get("/clientes", verificarToken, obtenerClientes);

// GET /api/clientes/buscar?termino=xxx -> buscar cliente (requiere token)
router.get("/clientes/buscar", verificarToken, buscarCliente);

export default router;