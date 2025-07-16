//transacciones.routes.js
import express from "express";
import * as transaccionesController from "../controllers/transacciones.controller.js";
import { verificarToken } from "../middlewares/verificarToken.js";

const router = express.Router();

// 🛡️ Todas las rutas protegidas
router.get("/", verificarToken, transaccionesController.getTransacciones);
router.post("/", verificarToken, (req, res, next) => {
    console.log("🔥 Llegó un POST a /api/transacciones");
    console.log("Headers:", req.headers);
    next();
}, transaccionesController.createTransaccion);
export default router;
