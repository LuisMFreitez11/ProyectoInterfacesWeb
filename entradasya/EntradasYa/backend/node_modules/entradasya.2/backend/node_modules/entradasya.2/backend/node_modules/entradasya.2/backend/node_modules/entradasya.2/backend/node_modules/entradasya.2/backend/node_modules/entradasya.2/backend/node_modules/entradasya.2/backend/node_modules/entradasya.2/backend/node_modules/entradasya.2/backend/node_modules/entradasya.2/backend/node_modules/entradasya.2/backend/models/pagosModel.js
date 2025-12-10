const { db } = require('../config/db');

// Payment Model
class Payment {
  constructor(data) {
    this.id_pago = data.id_pago;
    this.id_compra = data.id_compra;
    this.id_metodo_pago = data.id_metodo_pago;
    this.monto = data.monto;
    this.fecha_pago = data.fecha_pago;
    this.estado = data.estado;
    this.referencia = data.referencia;
    this.fecha_creacion = data.fecha_creacion;
  }

  static async findAll() {
    try {
      const [rows] = await db.execute('SELECT * FROM pagos ORDER BY fecha_pago DESC');
      return rows.map(row => new Payment(row));
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute('SELECT * FROM pagos WHERE id_pago = ?', [id]);
      if (rows.length === 0) return null;
      return new Payment(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const { id_compra, id_metodo_pago, monto, estado = 'pendiente', referencia = null } = data;
      const [result] = await db.execute(
        'INSERT INTO pagos (id_compra, id_metodo_pago, monto, fecha_pago, estado, referencia, fecha_creacion) VALUES (?, ?, ?, NOW(), ?, ?, NOW())',
        [id_compra, id_metodo_pago, monto, estado, referencia]
      );
      return { id_pago: result.insertId, ...data };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const { id_compra, id_metodo_pago, monto, fecha_pago, estado, referencia } = data;
      const [result] = await db.execute(
        'UPDATE pagos SET id_compra = ?, id_metodo_pago = ?, monto = ?, fecha_pago = ?, estado = ?, referencia = ? WHERE id_pago = ?',
        [id_compra, id_metodo_pago, monto, fecha_pago, estado, referencia, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.execute('DELETE FROM pagos WHERE id_pago = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

// PaymentMethod Model
class PaymentMethod {
  constructor(data) {
    this.id_metodo_pago = data.id_metodo_pago;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion;
    this.activo = data.activo;
    this.fecha_creacion = data.fecha_creacion;
  }

  static async findAll() {
    try {
      const [rows] = await db.execute('SELECT * FROM metodos_pago ORDER BY nombre ASC');
      return rows.map(row => new PaymentMethod(row));
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute('SELECT * FROM metodos_pago WHERE id_metodo_pago = ?', [id]);
      if (rows.length === 0) return null;
      return new PaymentMethod(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const { nombre, descripcion, activo = 1 } = data;
      const [result] = await db.execute(
        'INSERT INTO metodos_pago (nombre, descripcion, activo, fecha_creacion) VALUES (?, ?, ?, NOW())',
        [nombre, descripcion, activo]
      );
      return { id_metodo_pago: result.insertId, ...data };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const { nombre, descripcion, activo } = data;
      const [result] = await db.execute(
        'UPDATE metodos_pago SET nombre = ?, descripcion = ?, activo = ? WHERE id_metodo_pago = ?',
        [nombre, descripcion, activo, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.execute('DELETE FROM metodos_pago WHERE id_metodo_pago = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = { Payment, PaymentMethod };
