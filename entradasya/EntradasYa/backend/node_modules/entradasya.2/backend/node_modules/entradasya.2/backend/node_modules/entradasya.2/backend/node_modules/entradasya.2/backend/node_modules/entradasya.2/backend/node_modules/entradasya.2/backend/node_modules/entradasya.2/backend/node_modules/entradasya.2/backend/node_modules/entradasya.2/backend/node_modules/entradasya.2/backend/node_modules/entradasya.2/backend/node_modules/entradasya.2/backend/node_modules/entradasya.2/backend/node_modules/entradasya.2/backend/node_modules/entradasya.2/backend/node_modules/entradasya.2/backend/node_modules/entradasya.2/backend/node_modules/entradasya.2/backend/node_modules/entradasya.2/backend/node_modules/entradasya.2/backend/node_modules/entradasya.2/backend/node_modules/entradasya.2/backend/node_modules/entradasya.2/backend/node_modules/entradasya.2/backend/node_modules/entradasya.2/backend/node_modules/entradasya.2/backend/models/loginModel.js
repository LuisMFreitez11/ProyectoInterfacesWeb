const { getDB } = require("../config/db");
const bcrypt = require("bcryptjs");

// Roles ID's (para consistencia interna)
const CLIENTE_ROLE_ID = 5;

class User {
  constructor(data) {
    this.id_usuario = data.id_usuario;
    this.nombre = data.nombre;
    this.apellido = data.apellido;
    this.email = data.email;
    this.contraseña_hash = data.contraseña_hash;
    this.telefono = data.telefono;
    this.fecha_registro = data.fecha_registro;
    this.activo = data.activo;
    this.id_rol = data.id_rol || data.id_role || null;
  }

  static async findAll() {
    try {
      const db = getDB();
      const [rows] = await db.execute(`
SELECT u.*, ur.id_role AS id_rol
FROM usuarios u
LEFT JOIN usuario_roles ur ON u.id_usuario = ur.id_usuario
ORDER BY u.fecha_registro DESC`);
      return rows.map((row) => new User(row));
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const db = getDB();
      const [rows] = await db.execute(
        `
SELECT u.*, ur.id_role AS id_rol
FROM usuarios u
LEFT JOIN usuario_roles ur ON u.id_usuario = ur.id_usuario
WHERE u.id_usuario = ?`,
        [id]
      );

      if (rows.length === 0) return null;
      return new User(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const db = getDB();
      const [rows] = await db.execute(
        `
SELECT u.*, ur.id_role AS id_rol
FROM usuarios u
LEFT JOIN usuario_roles ur ON u.id_usuario = ur.id_usuario
WHERE u.email = ?`,
        [email]
      );

      if (rows.length === 0) return null;

      return new User(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const db = getDB();

      const {
        nombre,
        email,
        contrasena_hash: contraseña_hash,
        apellido = null,
        telefono = null,
        activo = 1,
      } = data;

      const id_rol_to_insert = data.id_rol || CLIENTE_ROLE_ID;

      const [result] = await db.execute(
        // 🔑 CONSULTA DE INSERCIÓN CORREGIDA
        `INSERT INTO usuarios 
(nombre, apellido, email, contraseña_hash, telefono, activo, fecha_registro, id_rol)
VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
        [
          nombre,
          apellido,
          email,
          contraseña_hash,
          telefono,
          activo,
          id_rol_to_insert,
        ]
      );

      return {
        id_usuario: result.insertId,
        nombre,
        apellido,
        email,
        telefono,
        activo,
        id_rol: id_rol_to_insert,
      };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const db = getDB();
      const { nombre, apellido, email, telefono, activo, id_rol } = data;

      const [result] = await db.execute(
        `UPDATE usuarios 
         SET nombre = ?, apellido = ?, email = ?, telefono = ?, activo = ?, id_rol = ?
         WHERE id_usuario = ?`,
        [nombre, apellido, email, telefono, activo, id_rol, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const db = getDB();
      const [result] = await db.execute(
        `DELETE FROM usuarios WHERE id_usuario = ?`,
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  async comparePassword(password) {
    return await bcrypt.compare(password, this.contraseña_hash);
  }
}

class Role {
  constructor(data) {
    this.id_rol = data.id_rol;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion;
  }

  static async findAll() {
    const db = getDB();
    const [rows] = await db.execute(`SELECT * FROM roles`);
    return rows.map((row) => new Role(row));
  }

  static async findById(id) {
    const db = getDB();
    const [rows] = await db.execute(`SELECT * FROM roles WHERE id_rol = ?`, [
      id,
    ]);
    if (rows.length === 0) return null;
    return new Role(rows[0]);
  }

  static async create(data) {
    const db = getDB();
    const { nombre, descripcion } = data;

    const [result] = await db.execute(
      `INSERT INTO roles (nombre, descripcion)
       VALUES (?, ?)`,
      [nombre, descripcion]
    );

    return { id_rol: result.insertId, ...data };
  }

  static async update(id, data) {
    const db = getDB();
    const { nombre, descripcion } = data;

    const [result] = await db.execute(
      `UPDATE roles 
       SET nombre = ?, descripcion = ?
       WHERE id_rol = ?`,
      [nombre, descripcion, id]
    );

    return result.affectedRows > 0;
  }

  static async delete(id) {
    const db = getDB();
    const [result] = await db.execute(`DELETE FROM roles WHERE id_rol = ?`, [
      id,
    ]);
    return result.affectedRows > 0;
  }
}

module.exports = { User, Role };
