const { db } = require('../config/db');

// AccountingMovement Model
class AccountingMovement {
  constructor(data) {
    this.id_movimiento = data.id_movimiento;
    this.tipo = data.tipo;
    this.descripcion = data.descripcion;
    this.monto = data.monto;
    this.fecha_movimiento = data.fecha_movimiento;
    this.id_usuario = data.id_usuario;
    this.fecha_creacion = data.fecha_creacion;
  }

  static async findAll() {
    try {
      const [rows] = await db.execute('SELECT * FROM movimientos_contables ORDER BY fecha_movimiento DESC');
      return rows.map(row => new AccountingMovement(row));
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute('SELECT * FROM movimientos_contables WHERE id_movimiento = ?', [id]);
      if (rows.length === 0) return null;
      return new AccountingMovement(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const { tipo, descripcion, monto, fecha_movimiento = new Date(), id_usuario } = data;
      const [result] = await db.execute(
        'INSERT INTO movimientos_contables (tipo, descripcion, monto, fecha_movimiento, id_usuario, fecha_creacion) VALUES (?, ?, ?, ?, ?, NOW())',
        [tipo, descripcion, monto, fecha_movimiento, id_usuario]
      );
      return { id_movimiento: result.insertId, ...data };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const { tipo, descripcion, monto, fecha_movimiento, id_usuario } = data;
      const [result] = await db.execute(
        'UPDATE movimientos_contables SET tipo = ?, descripcion = ?, monto = ?, fecha_movimiento = ?, id_usuario = ? WHERE id_movimiento = ?',
        [tipo, descripcion, monto, fecha_movimiento, id_usuario, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.execute('DELETE FROM movimientos_contables WHERE id_movimiento = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = { AccountingMovement };
