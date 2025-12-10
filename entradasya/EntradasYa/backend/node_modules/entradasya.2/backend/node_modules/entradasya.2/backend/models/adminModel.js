const { getDB } = require('../config/db');

// Admin Model (for admin-specific operations)
class Admin {
  constructor(data) {
    this.id_admin = data.id_admin;
    this.id_usuario = data.id_usuario;
    this.nivel_acceso = data.nivel_acceso;
    this.fecha_creacion = data.fecha_creacion;
  }

  static async findAll() {
    try {
      const dbConnection = getDB(); // 👈 OBTENER LA CONEXIÓN
      const [rows] = await dbConnection.execute('SELECT * FROM admins ORDER BY fecha_creacion DESC');
      return rows.map(row => new Admin(row));
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const dbConnection = getDB(); // 👈 OBTENER LA CONEXIÓN
      const [rows] = await dbConnection.execute('SELECT * FROM admins WHERE id_admin = ?', [id]);
      if (rows.length === 0) return null;
      return new Admin(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const dbConnection = getDB(); // 👈 OBTENER LA CONEXIÓN
      
      // Asegurar que la conexión exista antes de usarla
      if (!dbConnection) {
          throw new Error("La conexión a la base de datos no está inicializada.");
      }

      const { id_usuario, nivel_acceso = 1 } = data;
      const [result] = await dbConnection.execute( // 👈 USAR LA CONEXIÓN
        'INSERT INTO admins (id_usuario, nivel_acceso, fecha_creacion) VALUES (?, ?, NOW())',
        [id_usuario, nivel_acceso]
      );
      return { id_admin: result.insertId, ...data };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const dbConnection = getDB(); // 👈 OBTENER LA CONEXIÓN
      const { id_usuario, nivel_acceso } = data;
      const [result] = await dbConnection.execute( // 👈 USAR LA CONEXIÓN
        'UPDATE admins SET id_usuario = ?, nivel_acceso = ? WHERE id_admin = ?',
        [id_usuario, nivel_acceso, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const dbConnection = getDB(); // 👈 OBTENER LA CONEXIÓN
      const [result] = await dbConnection.execute('DELETE FROM admins WHERE id_admin = ?', [id]); // 👈 USAR LA CONEXIÓN
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = { Admin };
