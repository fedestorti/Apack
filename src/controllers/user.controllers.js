// controllers/user.controllers.js
import bcrypt   from 'bcrypt';
import jwt      from 'jsonwebtoken';
import { pool } from '../db.js';


const SECRET = process.env.JWT_SECRET;
const ALG    = 'HS256';
const COOKIE_OPTS = {
  httpOnly : true,
  secure   : process.env.NODE_ENV === 'production',
  sameSite : 'lax',
  maxAge   : 15 * 60 * 1000      // 15 min
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
  }

  try {
    /* 1 · Buscar usuario (case-insensitive) */
    const { rows } = await pool.query(
      `SELECT id, nombre, apellido, email, contraseña
         FROM usuarios
        WHERE LOWER(email) = LOWER($1)`,
      [email]
    );
    if (!rows.length) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = rows[0];

    /* 2 · Comparar hash bcrypt */
    const ok = await bcrypt.compare(password, user.contraseña);
    if (!ok) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    /* 3 · Firmar JWT y devolver cookie */
    const token = jwt.sign({ id: user.id }, SECRET,
                           { algorithm: ALG, expiresIn: '15m' });

                           res.json({
                            message: 'Inicio de sesión exitoso',
                            token,
                            usuario: {
                              id: user.id,
                              nombre: user.nombre,
                              apellido: user.apellido,
                              email: user.email
                            }
                          });
  } catch (err) {
    console.error('loginUser error:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
