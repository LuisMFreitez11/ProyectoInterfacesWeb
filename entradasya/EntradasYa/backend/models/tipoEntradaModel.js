// models/TipoEntrada.js
const { getDB } = require('../config/db');

class TipoEntrada {
  constructor(data) {
    this.id_tipo = data.id_tipo;
    this.id_evento = data.id_evento;
    this.nombre_tipo = data.nombre_tipo;
    this.zona = data.zona; // Generalmente igual a nombre_tipo
    this.color = data.color;
    this.filas = data.filas;
    this.asientos_por_fila = data.asientos_por_fila;
    this.precio = data.precio;
    this.cantidad_total = data.cantidad_total;
    this.cantidad_disponible = data.cantidad_disponible;
    this.reglas = data.reglas;
  }

  // --- Métodos de Consulta ---

  static async findByEventoId(id_evento) {
    try {
      const db = getDB();
      const [rows] = await db.execute(
        'SELECT * FROM tiposentrada WHERE id_evento = ? ORDER BY precio DESC',
        [id_evento]
      );
      return rows.map(row => new TipoEntrada(row));
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const db = getDB();
      const [rows] = await db.execute('SELECT * FROM tiposentrada WHERE id_tipo = ?', [id]);
      if (rows.length === 0) return null;
      return new TipoEntrada(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // --- Métodos CRUD ---

  static async create(data) {
    const db = getDB();
    const { id_evento, nombre_tipo, precio, filas, asientos_por_fila, color = '#007BFF', reglas = null } = data;
    const cantidad_total = filas * asientos_por_fila;

    try {
      const [result] = await db.execute(
        `INSERT INTO tiposentrada 
         (id_evento, nombre_tipo, zona, precio, filas, asientos_por_fila, cantidad_total, cantidad_disponible, color, reglas) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id_evento, nombre_tipo, nombre_tipo, precio, filas, asientos_por_fila, cantidad_total, cantidad_total, color, reglas]
      );
      // Nota: Asumimos que al crear, cantidad_disponible = cantidad_total
      return { id_tipo: result.insertId, ...data, cantidad_total, cantidad_disponible: cantidad_total };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    const db = getDB();
    const { nombre_tipo, precio, filas, asientos_por_fila, color, reglas } = data;
    
    // Recalcular la capacidad total si cambian filas o asientos_por_fila
    let setClauses = [];
    let values = [];

    if (nombre_tipo !== undefined) { setClauses.push('nombre_tipo = ?, zona = ?'); values.push(nombre_tipo, nombre_tipo); }
    if (precio !== undefined) { setClauses.push('precio = ?'); values.push(precio); }
    if (color !== undefined) { setClauses.push('color = ?'); values.push(color); }
    if (reglas !== undefined) { setClauses.push('reglas = ?'); values.push(reglas); }

    let shouldRecalculateCapacity = false;
    let newCapacidad = null;
    
    if (filas !== undefined && asientos_por_fila !== undefined) {
        newCapacidad = filas * asientos_por_fila;
        setClauses.push('filas = ?'); values.push(filas);
        setClauses.push('asientos_por_fila = ?'); values.push(asientos_por_fila);
        setClauses.push('cantidad_total = ?'); values.push(newCapacidad);
        // Opcional: Esto podría requerir lógica compleja para actualizar cantidad_disponible si ya hay ventas.
        // Aquí, simplemente actualizamos la total, el admin deberá ajustar manualmente o tener cuidado.
    } else if (filas !== undefined) {
        setClauses.push('filas = ?'); values.push(filas);
        shouldRecalculateCapacity = true;
    } else if (asientos_por_fila !== undefined) {
        setClauses.push('asientos_por_fila = ?'); values.push(asientos_por_fila);
        shouldRecalculateCapacity = true;
    }

    if (shouldRecalculateCapacity) {
        // Lógica para recalcular la capacidad basada en el valor actual de la otra variable
        // (Esto es más complejo y podría dejarse para un stored procedure o controller específico si es crítico)
        // Por simplicidad, solo incluimos la lógica simple de arriba.
    }

    if (setClauses.length === 0) return false;

    values.push(id);
    const setString = setClauses.join(', ');

    try {
      const [result] = await db.execute(
        `UPDATE tiposentrada SET ${setString} WHERE id_tipo = ?`,
        values
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const db = getDB();
      // ¡ADVERTENCIA! DEBE VERIFICAR SI HAY TICKETS ASOCIADOS (tabla compra_detalle y tickets)
      // Antes de permitir la eliminación. Por ahora, solo eliminamos.
      const [result] = await db.execute('DELETE FROM tiposentrada WHERE id_tipo = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = { TipoEntrada };