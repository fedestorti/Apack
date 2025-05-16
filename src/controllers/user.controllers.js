import { pool } from '../db.js';
import bcrypt from 'bcrypt';


/**Buscar usuarios*/
export const getUsers = async(req, res) => {
    /**Solo Traemos las filas*/
    const { rows } = await pool.query('SELECT * FROM users')
    res.json(rows);
}


/**Buscar usuario individual*/
export const getUser = async(req, res) => {
    const { id } = req.params;
    /**Solo Traemos las filas especifica*/
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    /**Consultamos si se encotro Usuario*/
    if (rows.length === 0){
        return res.status(404).json({ message: "Usuario no Encontrado"});
    }

    res.json(rows[0]);
}


/**Crear Usuario*/
export const createUser = async (req, res) => {
    try {
        const { name, surname, email, password } = req.body;

        const emailCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(409).json({ message: "Email ya existente" });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // 🔐 Encriptar

        const { rows } = await pool.query(
            "INSERT INTO users (name, surname, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, surname, email, hashedPassword]
        );

        return res.json(rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


/**Eliminar Usuario*/
export const deleteUser = async (req, res) => {
    const { id } = req.params;
    /**Solo Elimina al Usuario*/
    const { rows, rowCount } = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]
    );
    /**Consultamos si se encotro Usuario*/
    if (rowCount === 0) {
        return res.status(404).json({ message: "Usuario no Encontrado"});
    }
    return res.sendStatus(204);
}


/**Modificar Usuario*/
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    // Validamos campos requeridos
    if (!data.name || !data.surname || !data.email || !data.password) {
        return res.status(400).json({ message: "No se permiten campos vacios" });
    }

    try {
        const result = await pool.query(
            "UPDATE users SET name = $2, surname = $3, email = $4, password = $5 WHERE id = $1 RETURNING *",
            [id, data.name, data.surname, data.email, data.password]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al actualizar el usuario" });
    }
};


/**Inicio de Sesion(Beta)*/
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email y contraseña son obligatorios" });
    }

    try {
        const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const user = rows[0];

        const match = await bcrypt.compare(password, user.password); // 🔐 Comparar

        if (!match) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        // Opcional: elimina la contraseña antes de enviar el usuario al frontend
        delete user.password;

        res.json({ message: "Inicio de sesión exitoso", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};