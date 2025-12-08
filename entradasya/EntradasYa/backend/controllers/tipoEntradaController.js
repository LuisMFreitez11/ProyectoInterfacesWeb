// controllers/tiposEntradaController.js
const { TipoEntrada } = require('../models/TipoEntrada');

// Obtener todos los tipos de entrada para un evento (necesario para el modal de gestión)
const getTiposEntradaByEvento = async (req, res) => {
  try {
    const { id_evento } = req.params;
    const tipos = await TipoEntrada.findByEventoId(id_evento);
    res.json({ success: true, data: tipos, message: `Tipos de entrada para evento ${id_evento} obtenidos.` });
  } catch (error) {
    console.error('Error al obtener tipos de entrada:', error);
    res.status(500).json({ success: false, message: 'Error al obtener tipos de entrada', error: error.message });
  }
};

// Obtener un tipo de entrada por ID
const getTipoEntradaById = async (req, res) => {
  try {
    const { id } = req.params;
    const tipo = await TipoEntrada.findById(id);
    if (!tipo) return res.status(404).json({ success: false, message: 'Tipo de entrada no encontrado' });
    res.json({ success: true, data: tipo, message: 'Tipo de entrada obtenido exitosamente' });
  } catch (error) {
    console.error('Error al obtener tipo de entrada:', error);
    res.status(500).json({ success: false, message: 'Error al obtener tipo de entrada', error: error.message });
  }
};

// Crear un tipo de entrada
const createTipoEntrada = async (req, res) => {
  try {
    const requiredFields = ['id_evento', 'nombre_tipo', 'precio', 'filas', 'asientos_por_fila'];
    const missingFields = requiredFields.filter(field => !req.body[field] && req.body[field] !== 0);

    if (missingFields.length > 0) {
      return res.status(400).json({ success: false, message: `Campos requeridos faltantes: ${missingFields.join(', ')}` });
    }

    const newTipo = await TipoEntrada.create(req.body);
    res.status(201).json({ success: true, data: newTipo, message: 'Tipo de entrada creado exitosamente' });
  } catch (error) {
    console.error('Error al crear tipo de entrada:', error);
    res.status(500).json({ success: false, message: 'Error al crear tipo de entrada', error: error.message });
  }
};

// Actualizar un tipo de entrada
const updateTipoEntrada = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await TipoEntrada.update(id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Tipo de entrada no encontrado o sin cambios' });
    res.json({ success: true, message: 'Tipo de entrada actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar tipo de entrada:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar tipo de entrada', error: error.message });
  }
};

// Eliminar un tipo de entrada
const deleteTipoEntrada = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await TipoEntrada.delete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Tipo de entrada no encontrado' });
    res.json({ success: true, message: 'Tipo de entrada eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar tipo de entrada:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar tipo de entrada', error: error.message });
  }
};

module.exports = {
  getTiposEntradaByEvento,
  getTipoEntradaById,
  createTipoEntrada,
  updateTipoEntrada,
  deleteTipoEntrada
};