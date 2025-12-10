const { getDB } = require('../config/db');

class Event {
  static async findAll() {
    const pool = getDB();
    const [rows] = await pool.query(`
      SELECT e.*, l.nombre AS lugar_nombre, a.nombre AS artista_nombre
      FROM events e
      LEFT JOIN places l ON e.id_lugar = l.id_lugar
      LEFT JOIN artists a ON e.id_artista = a.id_artista
    `);
    return rows;
  }

  static async findById(id) {
    const pool = getDB();
    const [rows] = await pool.query('SELECT * FROM events WHERE id_evento = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const pool = getDB();
    const { nombre, descripcion, fecha, hora, id_lugar, id_artista, capacidad, precio_base, estado } = data;
    const [result] = await pool.query(
      `INSERT INTO events (nombre, descripcion, fecha, hora, id_lugar, id_artista, capacidad, precio_base, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion, fecha, hora, id_lugar, id_artista, capacidad, precio_base, estado]
    );
    return { id_evento: result.insertId, ...data };
  }

  static async update(id, data) {
    const pool = getDB();
    const { nombre, descripcion, fecha, hora, id_lugar, id_artista, capacidad, precio_base, estado } = data;
    const [result] = await pool.query(
      `UPDATE events SET nombre=?, descripcion=?, fecha=?, hora=?, id_lugar=?, id_artista=?, capacidad=?, precio_base=?, estado=?
       WHERE id_evento=?`,
      [nombre, descripcion, fecha, hora, id_lugar, id_artista, capacidad, precio_base, estado, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const pool = getDB();
    const [result] = await pool.query('DELETE FROM events WHERE id_evento=?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = { Event };
