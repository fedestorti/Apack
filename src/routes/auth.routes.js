//src/routes/auth.routes.js
import { Router } from 'express';
import { loginUser } from '../controllers/user.controllers.js';
import { verificarToken } from '../middlewares/verificarToken.js';

const router = Router();

// Login
router.post('/login', loginUser);

// Verificación rápida (cabezera HEAD)
router.head('/verify', verificarToken, (_req, res) => res.sendStatus(200));

// Logout
router.post('/logout', (_req, res) => {
  res.clearCookie('token', {
    httpOnly : true,
    secure   : process.env.NODE_ENV === 'production',
    sameSite : 'lax'
  }).sendStatus(204);
});

export default router;
