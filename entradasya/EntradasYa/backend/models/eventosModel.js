const { getDB } = require('../config/db');

class Event {

  // ====================== GET ALL EVENTS ======================
  static async findAll() {
    const pool = getDB();

    const [rows] = await pool.query(`
      SELECT 
        e.*,
        l.nombre_lugar AS lugar_nombre,
        GROUP_CONCAT(CONCAT(a.id_artista, '|', a.nombre, '|', IFNULL(a.apellido,'')) SEPARATOR '||') AS artistas_info_str 
      FROM eventos e
      LEFT JOIN lugares l ON e.id_lugar = l.id_lugar
      LEFT JOIN artistas_eventos ae ON ae.id_evento = e.id_evento
      LEFT JOIN artistas a ON a.id_artista = ae.id_artista
      GROUP BY e.id_evento
      ORDER BY e.fecha_inicio DESC
    `);

    return rows.map(e => {
      let artistasArray = [];

      if (e.artistas_info_str) {
        artistasArray = e.artistas_info_str.split('||').map(info => {
          const [id, nombre, apellido] = info.split('|');
          return {
            id_artista: Number(id),
            nombre: nombre.trim(),
            apellido: apellido.trim()
          };
        });
      }

      return {
        ...e,
        artistas: artistasArray,
        artistas_ids: artistasArray.map(a => a.id_artista),
        artistas_nombres: artistasArray.map(a => `${a.nombre} ${a.apellido}`).join(', ')
      };
    });
  }

  // ====================== GET EVENT BY ID ======================
  static async findById(id) {
    const pool = getDB();

    const [rows] = await pool.query(`
      SELECT 
        e.*,
        l.nombre_lugar AS lugar_nombre,
        GROUP_CONCAT(a.id_artista) AS artistas_ids
      FROM eventos e
      LEFT JOIN lugares l ON e.id_lugar = l.id_lugar
      LEFT JOIN artistas_eventos ae ON ae.id_evento = e.id_evento
      LEFT JOIN artistas a ON a.id_artista = ae.id_artista
      WHERE e.id_evento = ?
      GROUP BY e.id_evento
    `, [id]);

    if (rows.length === 0) return null;

    const evento = rows[0];

    evento.artistas_ids = evento.artistas_ids
      ? evento.artistas_ids.split(',').map(id => Number(id))
      : [];

    return evento;
  }

  // ====================== CREATE EVENT ======================
  static async create(data) {
    const pool = getDB();
    const {
      nombre,
      descripcion,
      fecha_inicio,
      fecha_fin,
      capacidad_total,
      estado,
      id_lugar,
      artistas_ids,
      imagen
    } = data;

    const [result] = await pool.query(
      `INSERT INTO eventos 
        (nombre, descripcion, fecha_inicio, fecha_fin, capacidad_total, estado, id_lugar, imagen, id_organizador)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        descripcion || '',
        fecha_inicio,
        fecha_fin || null,
        capacidad_total || 1000,
        estado || 'borrador',
        id_lugar,
        imagen || null,
        1
      ]
    );

    const id_evento = result.insertId;

    // Insertar artistas
    if (artistas_ids && artistas_ids.length > 0) {
      const values = artistas_ids.map(id => [id_evento, id]);
      await pool.query(`INSERT INTO artistas_eventos (id_evento, id_artista) VALUES ?`, [values]);
    }

    return { id_evento };
  }

  // ====================== UPDATE EVENT ======================
  static async update(id, data) {
    const pool = getDB();
    const {
      nombre,
      descripcion,
      fecha_inicio,
      fecha_fin,
      capacidad_total,
      estado,
      id_lugar,
      artistas_ids,
      imagen
    } = data;

    await pool.query(
      `UPDATE eventos 
       SET nombre=?, descripcion=?, fecha_inicio=?, fecha_fin=?, capacidad_total=?, estado=?, id_lugar=?, imagen=?
       WHERE id_evento=?`,
      [
        nombre,
        descripcion || '',
        fecha_inicio,
        fecha_fin || null,
        capacidad_total || 1000,
        estado || 'borrador',
        id_lugar,
        imagen || null,
        id
      ]
    );

    // Actualizar artistas
    await pool.query(`DELETE FROM artistas_eventos WHERE id_evento = ?`, [id]);

    if (artistas_ids && artistas_ids.length > 0) {
      const values = artistas_ids.map(aid => [id, aid]);
      await pool.query(`INSERT INTO artistas_eventos (id_evento, id_artista) VALUES ?`, [values]);
    }

    return true;
  }

  // ====================== DELETE EVENT ======================
  static async delete(id) {
    const pool = getDB();

    // Verificar si tiene zonas
    const [tipos] = await pool.query(
      `SELECT COUNT(*) AS count FROM tiposentrada WHERE id_evento = ?`,
      [id]
    );

    if (tipos[0].count > 0) {
      throw new Error('No se puede eliminar el evento porque tiene zonas asociadas');
    }

    await pool.query(`DELETE FROM artistas_eventos WHERE id_evento = ?`, [id]);
    await pool.query(`DELETE FROM eventos WHERE id_evento = ?`, [id]);

    return true;
  }
}

module.exports = { Event };
