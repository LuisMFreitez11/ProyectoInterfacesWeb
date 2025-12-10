const { getDB } = require('../config/db');

// Entrada Model
class Entrada {
  constructor(data) {
    this.id_ticket = data.id_ticket;
    this.id_detalle = data.id_detalle;
    this.codigo = data.codigo;
    this.codigo_qr_svg = data.codigo_qr_svg;
    this.estado = data.estado;
    this.fecha_emitido = data.fecha_emitido;
    this.fecha_validado = data.fecha_validado;
    this.validador_id = data.validador_id;
  }

  static async findAll() {
    try {
      const db = getDB();
      const [rows] = await db.execute('SELECT * FROM tickets ORDER BY fecha_emitido DESC');
      return rows.map(row => new Entrada(row));
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const db = getDB();
      const [rows] = await db.execute('SELECT * FROM tickets WHERE id_ticket = ?', [id]);
      if (rows.length === 0) return null;
      return new Entrada(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const { id_detalle, codigo, codigo_qr_svg = null, estado, fecha_emitido = new Date(), fecha_validado = null, validador_id = null } = data;
      const [result] = await db.execute(
        'INSERT INTO tickets (id_detalle, codigo, codigo_qr_svg, estado, fecha_emitido, fecha_validado, validador_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id_detalle, codigo, codigo_qr_svg, estado, fecha_emitido, fecha_validado, validador_id]
      );
      return { id_ticket: result.insertId, ...data };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const { id_detalle, codigo, codigo_qr_svg, estado, fecha_emitido, fecha_validado, validador_id } = data;
      const [result] = await db.execute(
        'UPDATE tickets SET id_detalle = ?, codigo = ?, codigo_qr_svg = ?, estado = ?, fecha_emitido = ?, fecha_validado = ?, validador_id = ? WHERE id_ticket = ?',
        [id_detalle, codigo, codigo_qr_svg, estado, fecha_emitido, fecha_validado, validador_id, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.execute('DELETE FROM tickets WHERE id_ticket = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async findByDateRange(startDate, endDate) {
    try {
      const [rows] = await db.execute('SELECT * FROM tickets WHERE fecha_emitido BETWEEN ? AND ? ORDER BY fecha_emitido DESC', [startDate, endDate]);
      return rows.map(row => new Entrada(row));
    } catch (error) {
      throw error;
    }
  }

  static async findAvailable() {
    try {
      const [rows] = await db.execute('SELECT * FROM tickets WHERE estado = ? ORDER BY fecha_emitido DESC', ['activo']);
      return rows.map(row => new Entrada(row));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = { Entrada };
