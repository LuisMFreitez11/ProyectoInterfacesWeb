const db = require('../config/db');
class Compra {
    constructor(data) {
        this.id_compra = data.id_compra;
        this.id_usuario = data.id_usuario;
        this.fecha_compra = data.fecha_compra;
        this.total = data.total;
        this.estado = data.estado;
        this.notas = data.notas;
    }

    /**
     * Crea un nuevo registro en la tabla 'compras'.
     * NOTA: Este método se usará dentro de una transacción en el controlador.
     * @param {Object} data - Datos de la compra.
     * @param {Object} connection - La conexión activa de la transacción.
     */
    static async create(data, connection) {
        const { id_usuario, total, estado = 'pendiente', notas = null } = data;
        const [result] = await connection.execute(
            'INSERT INTO compras (id_usuario, total, estado, notas) VALUES (?, ?, ?, ?)',
            [id_usuario, total, estado, notas]
        );
        return { id_compra: result.insertId, ...data };
    }
}

module.exports = Compra;