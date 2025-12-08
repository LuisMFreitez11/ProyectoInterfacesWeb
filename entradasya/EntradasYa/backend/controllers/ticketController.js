const { getDB } = require('../config/db'); 

/**
 * Busca los detalles de un ticket individual usando su token QR.
 * Ahora busca en la tabla `tickets` y hace JOIN con `pagos`.
 */
exports.getTicketDetailsByQrToken = async (req, res) => {
    const { qr_token } = req.query;

    if (!qr_token) {
        return res.status(400).json({ message: 'Token de seguridad requerido.' });
    }

    let connection;
    try {
        const dbPool = getDB();
        if (!dbPool || typeof dbPool.getConnection !== 'function') {
             throw new Error("El pool de la base de datos no está inicializado o no es válido.");
        }
        
        connection = await dbPool.getConnection();

        // 3. Ejecutar la consulta JOIN
        // Se selecciona el monto total del pago (p.monto) para distinguir del precio unitario del ticket (t.precio_unit)
        const sqlQuery = `
          SELECT 
            t.codigo AS qr_token, 
            t.precio_unit, 
            p.id_pago, 
            p.monto AS monto_total_pago,      
            te.nombre_tipo AS tipo_entrada,   
            e.nombre AS nombre_evento,
            s.fila, 
            s.numero AS asiento
          FROM tickets t
          JOIN pagos p ON t.id_pago = p.id_pago 
          JOIN tiposentrada te ON t.id_tipo = te.id_tipo
          JOIN eventos e ON te.id_evento = e.id_evento
          LEFT JOIN asientos s ON t.id_asiento = s.id_asiento 
          WHERE t.codigo = ?
        `;
        
        const [rows] = await connection.execute(sqlQuery, [qr_token]);

        if (rows.length === 0) {
            return res.status(400).json({ message: 'Ticket no encontrado o token inválido.' });
        }

        // 4. Devolver la respuesta al frontend
        res.json({
            id_pago: rows[0].id_pago, 
            nombre_evento: rows[0].nombre_evento,
            tipo_entrada: rows[0].tipo_entrada,
            asiento: rows[0].asiento ? `${rows[0].fila}${rows[0].asiento}` : 'General',
            precio_unit: rows[0].precio_unit,
            monto_total: rows[0].monto_total_pago // ✅ Nuevo campo enviado al frontend
        }); 

    } catch (error) {
        console.error('🚨 ERROR CRÍTICO EN LA FUNCIÓN getTicketDetailsByQrToken:', error);
        let errorMessage = 'Error interno del servidor al buscar ticket.';
        if (error.code) {
             errorMessage = `Error de MySQL (${error.code}): ${error.message}`;
        }

        res.status(500).json({ message: errorMessage });
    } finally {
        if (connection) connection.release();
    }
};

// Asegúrate de exportar la función si es necesario
// module.exports = { getTicketDetailsByQrToken: exports.getTicketDetailsByQrToken };