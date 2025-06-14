// src/middlewares/verificarToken.js

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const SECRET    = process.env.JWT_SECRET;
const ALGORITHM = 'HS256';  // algoritmo esperado al firmar

/**
 * Middleware de Express para proteger rutas con JWT.
 * Extrae el token de la cookie “token” o de la cabecera Authorization.
 * Devuelve 401 si no hay token o si expiró; 403 si la firma es inválida.
 */
export function verificarToken(req, res, next) {
  // 1) Extraer token
  const token = req.cookies?.token
             || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.sendStatus(401); // No autenticado
  }

  try {
    // 2) Verificar firma y algoritmo
    const decoded = jwt.verify(token, SECRET, { algorithms: [ALGORITHM] });
    req.user = decoded;           // p. ej. { id, role, exp, ... }
    return next();
  } catch (err) {
    console.error('JWT error:', err);
    // Token expirado → 401; otros errores de firma → 403
    return res.sendStatus(
      err.name === 'TokenExpiredError' ? 401 : 403
    );
  }
}
