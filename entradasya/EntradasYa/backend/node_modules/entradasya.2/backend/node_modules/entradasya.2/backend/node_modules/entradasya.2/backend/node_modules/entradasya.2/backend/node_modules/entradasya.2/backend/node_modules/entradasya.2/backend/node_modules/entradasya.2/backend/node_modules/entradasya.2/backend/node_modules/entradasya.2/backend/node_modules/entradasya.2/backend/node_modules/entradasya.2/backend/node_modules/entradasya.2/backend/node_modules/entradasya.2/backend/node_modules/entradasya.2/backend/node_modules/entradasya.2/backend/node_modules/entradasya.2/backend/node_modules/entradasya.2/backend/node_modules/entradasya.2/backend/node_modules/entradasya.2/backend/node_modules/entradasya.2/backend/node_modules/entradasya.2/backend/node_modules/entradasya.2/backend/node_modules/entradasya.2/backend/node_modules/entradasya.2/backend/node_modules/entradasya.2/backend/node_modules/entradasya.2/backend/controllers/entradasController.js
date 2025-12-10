const { getDB } = require('../config/db');

// Obtener todas las entradas
const getAllEntradas = async (req, res) => {
  try {
    const pool = getDB();
    const [rows] = await pool.query('SELECT * FROM tickets');
    res.json({ success: true, data: rows, message: 'Entradas obtenidas exitosamente' });
  } catch (error) {
    console.error('Error al obtener entradas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener entradas', error: error.message });
  }
};

// Obtener entrada por ID
const getEntradaById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getDB();
    const [rows] = await pool.query('SELECT * FROM tickets WHERE id_ticket = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Entrada no encontrada' });
    res.json({ success: true, data: rows[0], message: 'Entrada obtenida exitosamente' });
  } catch (error) {
    console.error('Error al obtener entrada:', error);
    res.status(500).json({ success: false, message: 'Error al obtener entrada', error: error.message });
  }
};

// Crear entrada
const createEntrada = async (req, res) => {
  try {
    const { id_detalle, codigo, estado } = req.body;
    if (!id_detalle || !codigo || !estado)
      return res.status(400).json({ success: false, message: 'Campos requeridos: id_detalle, codigo, estado' });

    const pool = getDB();
    const [result] = await pool.query(
      'INSERT INTO tickets (id_detalle, codigo, estado) VALUES (?, ?, ?)',
      [id_detalle, codigo, estado]
    );

    const [newEntry] = await pool.query('SELECT * FROM tickets WHERE id_ticket = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newEntry[0], message: 'Entrada creada exitosamente' });
  } catch (error) {
    console.error('Error al crear entrada:', error);
    res.status(500).json({ success: false, message: 'Error al crear entrada', error: error.message });
  }
};

// Actualizar entrada
const updateEntrada = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getDB();
    const [result] = await pool.query('UPDATE tickets SET ? WHERE id_ticket = ?', [req.body, id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Entrada no encontrada' });
    res.json({ success: true, message: 'Entrada actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar entrada:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar entrada', error: error.message });
  }
};

// Eliminar entrada
const deleteEntrada = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getDB();
    const [result] = await pool.query('DELETE FROM tickets WHERE id_ticket = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Entrada no encontrada' });
    res.json({ success: true, message: 'Entrada eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar entrada:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar entrada', error: error.message });
  }
};

// Entradas disponibles
const getAvailableEntradas = async (req, res) => {
  try {
    const pool = getDB();
    const [rows] = await pool.query("SELECT * FROM tickets WHERE estado = 'valido'");
    res.json({ success: true, data: rows, message: 'Entradas disponibles obtenidas exitosamente' });
  } catch (error) {
    console.error('Error al obtener entradas disponibles:', error);
    res.status(500).json({ success: false, message: 'Error al obtener entradas disponibles', error: error.message });
  }
};

// Entradas por rango de fechas
const getEntradasByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ success: false, message: 'startDate y endDate son requeridos' });

    const pool = getDB();
    const [rows] = await pool.query(
      'SELECT * FROM tickets WHERE fecha_emitido BETWEEN ? AND ?',
      [startDate, endDate]
    );

    res.json({ success: true, data: rows, message: 'Entradas obtenidas por rango de fechas exitosamente' });
  } catch (error) {
    console.error('Error al obtener entradas por rango de fechas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener entradas por rango de fechas', error: error.message });
  }
};

module.exports = {
  getAllEntradas,
  getEntradaById,
  createEntrada,
  updateEntrada,
  deleteEntrada,
  getAvailableEntradas,
  getEntradasByDateRange
};
