const { getDB } = require('../config/db'); 

/**
 * Busca los detalles de un ticket individual usando su token QR (Solo Lectura).
 */
exports.getTicketDetailsByQrToken = async (req, res) => {
    const { qr_token } = req.query;

    if (!qr_token) {
        return res.status(400).json({ success: false, message: 'Token de seguridad requerido.' });
    }

    let connection;
    try {
        const dbPool = getDB();
        if (!dbPool || typeof dbPool.getConnection !== 'function') {
             throw new Error("El pool de la base de datos no está inicializado o no es válido.");
        }
        
        connection = await dbPool.getConnection();

        // 3. Ejecutar la consulta JOIN
        const sqlQuery = `
          SELECT 
            t.codigo AS qr_token, 
            t.precio_unit, 
            t.estado,  /* AGREGADO: Importante mostrar el estado actual */
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
            return res.status(404).json({ success: false, message: 'Ticket no encontrado o token inválido.' });
        }
        
        const ticket = rows[0];

        // 4. Devolver la respuesta al frontend
        res.json({
            success: true,
            id_pago: ticket.id_pago, 
            nombre_evento: ticket.nombre_evento,
            tipo_entrada: ticket.tipo_entrada,
            asiento: ticket.asiento ? `${ticket.fila}${ticket.asiento}` : 'General',
            precio_unit: ticket.precio_unit,
            monto_total: ticket.monto_total_pago, 
            estado_actual: ticket.estado // Nuevo campo para el frontend
        }); 

    } catch (error) {
        console.error('🚨 ERROR CRÍTICO EN LA FUNCIÓN getTicketDetailsByQrToken:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al buscar ticket.', error: error.message });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * Valida un ticket por su token QR y lo marca como usado (Control de Acceso).
 */
exports.validateAndUseTicket = async (req, res) => {
    const { qr_token } = req.body; 

    if (!qr_token) {
        return res.status(400).json({ success: false, message: 'Token de seguridad (QR) requerido para la validación.' });
    }

    let connection;
    try {
        const dbPool = getDB();
        connection = await dbPool.getConnection();
        await connection.beginTransaction(); // Iniciar transacción

        // 1. Buscar el ticket y bloquear la fila para evitar doble uso (FOR UPDATE)
        const [tickets] = await connection.execute(
            `SELECT 
                t.id_ticket, 
                t.estado, 
                te.nombre_tipo AS tipo_entrada,
                e.nombre AS nombre_evento
             FROM tickets t
             JOIN tiposentrada te ON t.id_tipo = te.id_tipo
             JOIN eventos e ON te.id_evento = e.id_evento
             WHERE t.codigo = ? FOR UPDATE`,
            [qr_token]
        );

        if (tickets.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Token Inválido o Ticket no encontrado.' });
        }

        const ticket = tickets[0];

        // 2. Verificar el estado
        if (ticket.estado !== 'valido') {
            await connection.rollback();
            const statusMessage = ticket.estado === 'usado' 
                ? 'Ticket ya utilizado. Acceso denegado.'
                : `Ticket en estado inválido: ${ticket.estado}.`;
            
            return res.status(400).json({ 
                success: false, 
                message: statusMessage,
                estado_actual: ticket.estado
            });
        }

        // 3. Marcar como usado y registrar la fecha de uso
        await connection.execute(
            `UPDATE tickets 
             SET estado = 'usado', fecha_uso = NOW() 
             WHERE id_ticket = ?`,
            [ticket.id_ticket]
        );
        
        await connection.commit(); // Confirmar la transacción
        
        // 4. Éxito
        return res.json({ 
            success: true, 
            message: "Acceso Permitido. Ticket validado correctamente.",
            ticket_info: {
                id_ticket: ticket.id_ticket,
                nombre_evento: ticket.nombre_evento,
                tipo_entrada: ticket.tipo_entrada,
                nuevo_estado: 'usado'
            }
        });

    } catch (error) {
        if (connection) {
            await connection.rollback(); // Deshacer si hay error
        }
        console.error('🚨 ERROR CRÍTICO EN LA FUNCIÓN validateAndUseTicket:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error de servidor al validar ticket (Transacción fallida).', 
            error: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
};


module.exports = {
    getTicketDetailsByQrToken: exports.getTicketDetailsByQrToken,
    validateAndUseTicket: exports.validateAndUseTicket,
};