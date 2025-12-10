const { BankReconciliation } = require('../models/conciliacionesBancariasModel');

// Controllers
const getAllBankReconciliations = async (req, res) => {
  try {
    const reconciliations = await BankReconciliation.findAll();
    res.json({ success: true, data: reconciliations, message: 'Conciliaciones bancarias obtenidas exitosamente' });
  } catch (error) {
    console.error('Error getting bank reconciliations:', error);
    res.status(500).json({ success: false, message: 'Error al obtener conciliaciones bancarias', error: error.message });
  }
};

const getBankReconciliationById = async (req, res) => {
  try {
    const { id } = req.params;
    const reconciliation = await BankReconciliation.findById(id);
    if (!reconciliation) {
      return res.status(404).json({ success: false, message: 'Conciliación bancaria no encontrada' });
    }
    res.json({ success: true, data: reconciliation, message: 'Conciliación bancaria obtenida exitosamente' });
  } catch (error) {
    console.error('Error getting bank reconciliation by id:', error);
    res.status(500).json({ success: false, message: 'Error al obtener conciliación bancaria', error: error.message });
  }
};

const createBankReconciliation = async (req, res) => {
  try {
    const { fecha_conciliacion, saldo_libro, saldo_banco, diferencia, observaciones, id_usuario } = req.body;
    if (!fecha_conciliacion || saldo_libro === undefined || saldo_banco === undefined || diferencia === undefined || !id_usuario) {
      return res.status(400).json({ success: false, message: 'Campos requeridos: fecha_conciliacion, saldo_libro, saldo_banco, diferencia, id_usuario' });
    }
    const newReconciliation = await BankReconciliation.create(req.body);
    res.status(201).json({ success: true, data: newReconciliation, message: 'Conciliación bancaria creada exitosamente' });
  } catch (error) {
    console.error('Error creating bank reconciliation:', error);
    res.status(500).json({ success: false, message: 'Error al crear conciliación bancaria', error: error.message });
  }
};

const updateBankReconciliation = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await BankReconciliation.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Conciliación bancaria no encontrada' });
    }
    res.json({ success: true, message: 'Conciliación bancaria actualizada exitosamente' });
  } catch (error) {
    console.error('Error updating bank reconciliation:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar conciliación bancaria', error: error.message });
  }
};

const deleteBankReconciliation = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await BankReconciliation.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Conciliación bancaria no encontrada' });
    }
    res.json({ success: true, message: 'Conciliación bancaria eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting bank reconciliation:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar conciliación bancaria', error: error.message });
  }
};

module.exports = {
  getAllBankReconciliations,
  getBankReconciliationById,
  createBankReconciliation,
  updateBankReconciliation,
  deleteBankReconciliation
};
