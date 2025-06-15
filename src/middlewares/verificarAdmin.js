// src/middlewares/verificarAdmin.js
export function verificarAdmin(req, res, next) {
    if (req.user?.rol !== 'admin') return res.sendStatus(403); // Forbidden
    next();
  }