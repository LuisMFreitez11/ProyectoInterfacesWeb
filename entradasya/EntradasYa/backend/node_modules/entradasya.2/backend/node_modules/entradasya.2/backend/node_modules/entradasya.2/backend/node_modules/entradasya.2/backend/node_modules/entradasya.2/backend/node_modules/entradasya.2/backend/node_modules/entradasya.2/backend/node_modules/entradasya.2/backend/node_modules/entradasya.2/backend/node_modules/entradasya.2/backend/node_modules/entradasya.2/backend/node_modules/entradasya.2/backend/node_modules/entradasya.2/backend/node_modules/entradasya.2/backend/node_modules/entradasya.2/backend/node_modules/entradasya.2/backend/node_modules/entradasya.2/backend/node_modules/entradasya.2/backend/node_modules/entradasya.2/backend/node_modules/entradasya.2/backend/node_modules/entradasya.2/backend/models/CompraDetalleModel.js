const { db } = require('../config/db');

class CompraDetalle {
    constructor(data) {
        this.id_detalle = data.id_detalle;
        this.id_compra = data.id_compra;
        this.id_tipo = data.id_tipo;
        this.cantidad = data.cantidad;
        this.precio_unit = data.precio_unit;
        this.subtotal = data.subtotal;
        this.qr_token = data.qr_token;
    }

    /**
     * Crea múltiples registros de detalle.
     * @param {Array<Object>} detalles - Array de objetos de detalle.
     * @param {Object} connection - La conexión activa de la transacción.
     */
    static async bulkCreate(detalles, connection) {
        if (!detalles || detalles.length === 0) return;

        // Construir la consulta de inserción masiva
        const placeholders = detalles.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
        const values = [];
        
        detalles.forEach(d => {
            // 🎯 Aplicamos el operador || null para asegurar que nunca haya 'undefined'
            values.push(
                d.id_compra || null,
                d.id_tipo || null,
                d.cantidad || null,
                d.precio_unit || null,
                d.subtotal || null,
                d.qr_token || null
            );
        });

        await connection.execute(
            `INSERT INTO compra_detalle (id_compra, id_tipo, cantidad, precio_unit, subtotal, qr_token) VALUES ${placeholders}`,
            values
        );
    }
}

module.exports = CompraDetalle;