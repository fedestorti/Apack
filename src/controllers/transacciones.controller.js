//transacciones.controller.js
import { pool } from "../db.js"; // ✅ asegúrate de usar .js en la ruta

// 📝 Obtener todas las transacciones con detalles
export const getTransacciones = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                t.id_transaccion,
                t.fecha,
                t.total,
                t.tipo_de_pago,
                t.tipo_de_factura,
                c.dato_cliente AS cliente,
                u.nombre || ' ' || u.apellido AS usuario,
                td.id_detalle,
                p.nombre AS producto,
                td.cantidad,
                td.precio_unitario
            FROM
                transacciones t
            INNER JOIN cliente c ON t.id_cliente = c.id_cliente
            INNER JOIN usuarios u ON t.id_usuario = u.id
            INNER JOIN transaccion_detalle td ON t.id_transaccion = td.id_transaccion
            INNER JOIN productos p ON td.id_producto = p.id
            ORDER BY t.fecha DESC
        `);

        // Agrupar productos por transacción
        const transacciones = {};
        result.rows.forEach(row => {
            if (!transacciones[row.id_transaccion]) {
                transacciones[row.id_transaccion] = {
                    id_transaccion: row.id_transaccion,
                    fecha: row.fecha,
                    total: row.total,
                    tipo_de_pago: row.tipo_de_pago,
                    tipo_de_factura: row.tipo_de_factura,
                    cliente: row.cliente,
                    usuario: row.usuario,
                    productos: []
                };
            }
            transacciones[row.id_transaccion].productos.push({
                id_detalle: row.id_detalle,
                producto: row.producto,
                cantidad: row.cantidad,
                precio_unitario: row.precio_unitario
            });
        });

        res.json(Object.values(transacciones));
    } catch (error) {
        console.error("Error al obtener transacciones:", error);
        res.status(500).json({ error: "Error al obtener transacciones" });
    }
};

// ➕ Crear una nueva transacción
export const createTransaccion = async (req, res) => {
    console.log("📥 Body recibido:", req.body);

    const { id_cliente, tipo_de_pago, tipo_de_factura, cantidad, total, productos } = req.body;

    // ⚠️ Validar datos básicos
    if (!id_cliente || !tipo_de_pago || !tipo_de_factura || !cantidad || !total) {
        console.error("❌ Datos faltantes o inválidos");
        return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    try {
        await pool.query("BEGIN");
        console.log("✅ Insertando en transacciones...");

        const insertTransaccion = await pool.query(`
            INSERT INTO transacciones (cantidad, total, tipo_de_pago, tipo_de_factura, id_cliente)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id_transaccion
        `, [cantidad, total, tipo_de_pago, tipo_de_factura, id_cliente]);

        const id_transaccion = insertTransaccion.rows[0].id_transaccion;
        console.log("✅ Transacción creada con ID:", id_transaccion);

        if (!productos || productos.length === 0) {
            throw new Error("No hay productos para guardar");
        }

        for (const producto of productos) {
            console.log("🔄 Insertando producto:", producto);
            await pool.query(`
                INSERT INTO transaccion_detalle (id_transaccion, id_producto, cantidad, precio_unitario)
                VALUES ($1, $2, $3, $4)
            `, [
                id_transaccion,
                producto.id_producto,
                producto.cantidad,
                producto.precio_unitario
            ]);
        }

        await pool.query("COMMIT");
        console.log("✅ Transacción y productos guardados correctamente");
        res.status(201).json({ message: "Transacción creada correctamente", id_transaccion });
    } catch (error) {
        await pool.query("ROLLBACK");
        console.error("❌ Error al crear transacción:", error);
        res.status(500).json({ error: "Error al crear transacción", detalle: error.message });
    }
};
