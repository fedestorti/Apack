import { Router } from 'express';
import { Result } from 'pg';
import {updateUser,
        deleteUser,
        createUser,
        getUsers,
        getUser,
        loginUser} 
from '../controllers/user.controllers.js';

const router = Router();


/**Buscar usuarios*/
router.get("/users", getUsers);

/**Buscar usuario individual*/
router.get("/users/:id", getUser);

/**Crear Usuario*/
router.post("/users", createUser);

/**Eliminar Usuario*/
router.delete("/users/:id",deleteUser );

/**Modificar Usuario*/
router.put("/users/:id",updateUser );

/**Inicio de Sesion*/
router.post("/login", loginUser);

export default router;

