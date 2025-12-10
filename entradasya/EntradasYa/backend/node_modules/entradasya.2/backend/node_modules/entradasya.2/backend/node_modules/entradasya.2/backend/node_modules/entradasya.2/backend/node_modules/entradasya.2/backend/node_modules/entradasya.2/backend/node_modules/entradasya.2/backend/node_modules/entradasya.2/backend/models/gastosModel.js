const { db } = require('../config/db');

// Expense Model
class Expense {
  constructor(data) {
    this.id_gasto = data.id_gasto;
    this.id_categoria_gasto = data.id_categoria_gasto;
    this.descripcion = data.descripcion;
    this.monto = data.monto;
    this.fecha_gasto = data.fecha_gasto;
    this.id_usuario = data.id_usuario;
    this.fecha_creacion = data.fecha_creacion;
  }

  static async findAll() {
    try {
      const [rows] = await db.execute('SELECT * FROM gastos ORDER BY fecha_gasto DESC');
      return rows.map(row => new Expense(row));
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute('SELECT * FROM gastos WHERE id_gasto = ?', [id]);
      if (rows.length === 0) return null;
      return new Expense(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const { id_categoria_gasto, descripcion, monto, fecha_gasto = new Date(), id_usuario } = data;
      const [result] = await db.execute(
        'INSERT INTO gastos (id_categoria_gasto, descripcion, monto, fecha_gasto, id_usuario, fecha_creacion) VALUES (?, ?, ?, ?, ?, NOW())',
        [id_categoria_gasto, descripcion, monto, fecha_gasto, id_usuario]
      );
      return { id_gasto: result.insertId, ...data };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const { id_categoria_gasto, descripcion, monto, fecha_gasto, id_usuario } = data;
      const [result] = await db.execute(
        'UPDATE gastos SET id_categoria_gasto = ?, descripcion = ?, monto = ?, fecha_gasto = ?, id_usuario = ? WHERE id_gasto = ?',
        [id_categoria_gasto, descripcion, monto, fecha_gasto, id_usuario, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.execute('DELETE FROM gastos WHERE id_gasto = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

// ExpenseCategory Model
class ExpenseCategory {
  constructor(data) {
    this.id_categoria_gasto = data.id_categoria_gasto;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion;
    this.fecha_creacion = data.fecha_creacion;
  }

  static async findAll() {
    try {
      const [rows] = await db.execute('SELECT * FROM categorias_gasto ORDER BY nombre ASC');
      return rows.map(row => new ExpenseCategory(row));
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute('SELECT * FROM categorias_gasto WHERE id_categoria_gasto = ?', [id]);
      if (rows.length === 0) return null;
      return new ExpenseCategory(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const { nombre, descripcion } = data;
      const [result] = await db.execute(
        'INSERT INTO categorias_gasto (nombre, descripcion, fecha_creacion) VALUES (?, ?, NOW())',
        [nombre, descripcion]
      );
      return { id_categoria_gasto: result.insertId, ...data };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const { nombre, descripcion } = data;
      const [result] = await db.execute(
        'UPDATE categorias_gasto SET nombre = ?, descripcion = ? WHERE id_categoria_gasto = ?',
        [nombre, descripcion, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.execute('DELETE FROM categorias_gasto WHERE id_categoria_gasto = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = { Expense, ExpenseCategory };
