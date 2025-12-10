const { AccountingMovement } = require('../models/movimientosContablesModel');

// Controllers
const getAllAccountingMovements = async (req, res) => {
  try {
    const movements = await AccountingMovement.findAll();
    res.json({ success: true, data: movements, message: 'Movimientos contables obtenidos exitosamente' });
  } catch (error) {
    console.error('Error getting accounting movements:', error);
    res.status(500).json({ success: false, message: 'Error al obtener movimientos contables', error: error.message });
  }
};

const getAccountingMovementById = async (req, res) => {
  try {
    const { id } = req.params;
    const movement = await AccountingMovement.findById(id);
    if (!movement) {
      return res.status(404).json({ success: false, message: 'Movimiento contable no encontrado' });
    }
    res.json({ success: true, data: movement, message: 'Movimiento contable obtenido exitosamente' });
  } catch (error) {
    console.error('Error getting accounting movement by id:', error);
    res.status(500).json({ success: false, message: 'Error al obtener movimiento contable', error: error.message });
  }
};

const createAccountingMovement = async (req, res) => {
  try {
    const { tipo, descripcion, monto, id_usuario } = req.body;
    if (!tipo || !descripcion || !monto || !id_usuario) {
      return res.status(400).json({ success: false, message: 'Campos requeridos: tipo, descripcion, monto, id_usuario' });
    }
    const newMovement = await AccountingMovement.create(req.body);
    res.status(201).json({ success: true, data: newMovement, message: 'Movimiento contable creado exitosamente' });
  } catch (error) {
    console.error('Error creating accounting movement:', error);
    res.status(500).json({ success: false, message: 'Error al crear movimiento contable', error: error.message });
  }
};

const updateAccountingMovement = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await AccountingMovement.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Movimiento contable no encontrado' });
    }
    res.json({ success: true, message: 'Movimiento contable actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating accounting movement:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar movimiento contable', error: error.message });
  }
};

const deleteAccountingMovement = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await AccountingMovement.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Movimiento contable no encontrado' });
    }
    res.json({ success: true, message: 'Movimiento contable eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting accounting movement:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar movimiento contable', error: error.message });
  }
};

module.exports = {
  getAllAccountingMovements,
  getAccountingMovementById,
  createAccountingMovement,
  updateAccountingMovement,
  deleteAccountingMovement
};
