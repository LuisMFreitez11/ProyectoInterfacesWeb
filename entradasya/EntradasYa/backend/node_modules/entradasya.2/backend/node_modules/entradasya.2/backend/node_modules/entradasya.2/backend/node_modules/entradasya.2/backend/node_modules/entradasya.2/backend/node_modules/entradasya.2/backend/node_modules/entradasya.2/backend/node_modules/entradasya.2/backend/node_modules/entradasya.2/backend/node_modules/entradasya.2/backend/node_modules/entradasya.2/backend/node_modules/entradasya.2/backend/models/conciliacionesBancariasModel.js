const { db } = require('../config/db');

// BankReconciliation Model
class BankReconciliation {
  constructor(data) {
    this.id_conciliacion = data.id_conciliacion;
    this.fecha_conciliacion = data.fecha_conciliacion;
    this.saldo_libro = data.saldo_libro;
    this.saldo_banco = data.saldo_banco;
    this.diferencia = data.diferencia;
    this.observaciones = data.observaciones;
    this.id_usuario = data.id_usuario;
    this.fecha_creacion = data.fecha_creacion;
  }

  static async findAll() {
    try {
      const [rows] = await db.execute('SELECT * FROM conciliaciones_bancarias ORDER BY fecha_conciliacion DESC');
      return rows.map(row => new BankReconciliation(row));
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute('SELECT * FROM conciliaciones_bancarias WHERE id_conciliacion = ?', [id]);
      if (rows.length === 0) return null;
      return new BankReconciliation(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const { fecha_conciliacion, saldo_libro, saldo_banco, diferencia, observaciones, id_usuario } = data;
      const [result] = await db.execute(
        'INSERT INTO conciliaciones_bancarias (fecha_conciliacion, saldo_libro, saldo_banco, diferencia, observaciones, id_usuario, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [fecha_conciliacion, saldo_libro, saldo_banco, diferencia, observaciones, id_usuario]
      );
      return { id_conciliacion: result.insertId, ...data };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const { fecha_conciliacion, saldo_libro, saldo_banco, diferencia, observaciones, id_usuario } = data;
      const [result] = await db.execute(
        'UPDATE conciliaciones_bancarias SET fecha_conciliacion = ?, saldo_libro = ?, saldo_banco = ?, diferencia = ?, observaciones = ?, id_usuario = ? WHERE id_conciliacion = ?',
        [fecha_conciliacion, saldo_libro, saldo_banco, diferencia, observaciones, id_usuario, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.execute('DELETE FROM conciliaciones_bancarias WHERE id_conciliacion = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = { BankReconciliation };
