// controllers/tipoEntradaController.js
const { TipoEntrada } = require('../models/tipoEntradaModel');

// Obtener todos los tipos de entrada para un evento (necesario para el modal de gestión)
const getTiposEntradaByEvento = async (req, res) => {
  try {
    const { id_evento } = req.params;
    const tipos = await TipoEntrada.findByEventoId(id_evento);
    res.json(Array.isArray(tipos) ? tipos : (tipos.data || tipos));
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
    const body = req.body || {};
    // Requerimos id_evento, nombre_tipo y precio; aceptamos cantidad_total O filas+asientos_por_fila
    const missingBase = ['id_evento', 'nombre_tipo', 'precio'].filter(f => body[f] === undefined || body[f] === null || body[f] === '');
    if (missingBase.length > 0) {
      return res.status(400).json({ success: false, message: `Faltan campos requeridos: ${missingBase.join(', ')}` });
    }

    const hasCantidadTotal = body.cantidad_total !== undefined && body.cantidad_total !== null;
    const hasFilasAsientos = (body.filas !== undefined && body.asientos_por_fila !== undefined);

    if (!hasCantidadTotal && !hasFilasAsientos) {
      return res.status(400).json({ success: false, message: 'Debe proporcionar cantidad_total o filas y asientos_por_fila' });
    }

    // Normalizar datos para el modelo
    const datos = { ...body };
    if (hasCantidadTotal) {
      datos.cantidad_total = parseInt(body.cantidad_total, 10) || 0;
      // dejamos filas y asientos_por_fila como null para la base
      datos.filas = body.filas ?? null;
      datos.asientos_por_fila = body.asientos_por_fila ?? null;
    } else {
      datos.filas = parseInt(body.filas, 10) || 0;
      datos.asientos_por_fila = parseInt(body.asientos_por_fila, 10) || 0;
      datos.cantidad_total = datos.filas * datos.asientos_por_fila;
    }

    const newTipo = await TipoEntrada.create(datos);
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