const { Expense, ExpenseCategory } = require('../models/gastosModel');

// Expense Controllers
const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll();
    res.json({ success: true, data: expenses, message: 'Gastos obtenidos exitosamente' });
  } catch (error) {
    console.error('Error getting expenses:', error);
    res.status(500).json({ success: false, message: 'Error al obtener gastos', error: error.message });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Gasto no encontrado' });
    }
    res.json({ success: true, data: expense, message: 'Gasto obtenido exitosamente' });
  } catch (error) {
    console.error('Error getting expense by id:', error);
    res.status(500).json({ success: false, message: 'Error al obtener gasto', error: error.message });
  }
};

const createExpense = async (req, res) => {
  try {
    const { id_categoria_gasto, descripcion, monto, id_usuario } = req.body;
    if (!id_categoria_gasto || !descripcion || !monto || !id_usuario) {
      return res.status(400).json({ success: false, message: 'Campos requeridos: id_categoria_gasto, descripcion, monto, id_usuario' });
    }
    const newExpense = await Expense.create(req.body);
    res.status(201).json({ success: true, data: newExpense, message: 'Gasto creado exitosamente' });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ success: false, message: 'Error al crear gasto', error: error.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Expense.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Gasto no encontrado' });
    }
    res.json({ success: true, message: 'Gasto actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar gasto', error: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Expense.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Gasto no encontrado' });
    }
    res.json({ success: true, message: 'Gasto eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar gasto', error: error.message });
  }
};

// ExpenseCategory Controllers
const getAllExpenseCategories = async (req, res) => {
  try {
    const expenseCategories = await ExpenseCategory.findAll();
    res.json({ success: true, data: expenseCategories, message: 'Categorías de gasto obtenidas exitosamente' });
  } catch (error) {
    console.error('Error getting expense categories:', error);
    res.status(500).json({ success: false, message: 'Error al obtener categorías de gasto', error: error.message });
  }
};

const getExpenseCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const expenseCategory = await ExpenseCategory.findById(id);
    if (!expenseCategory) {
      return res.status(404).json({ success: false, message: 'Categoría de gasto no encontrada' });
    }
    res.json({ success: true, data: expenseCategory, message: 'Categoría de gasto obtenida exitosamente' });
  } catch (error) {
    console.error('Error getting expense category by id:', error);
    res.status(500).json({ success: false, message: 'Error al obtener categoría de gasto', error: error.message });
  }
};

const createExpenseCategory = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) {
      return res.status(400).json({ success: false, message: 'Campo requerido: nombre' });
    }
    const newExpenseCategory = await ExpenseCategory.create(req.body);
    res.status(201).json({ success: true, data: newExpenseCategory, message: 'Categoría de gasto creada exitosamente' });
  } catch (error) {
    console.error('Error creating expense category:', error);
    res.status(500).json({ success: false, message: 'Error al crear categoría de gasto', error: error.message });
  }
};

const updateExpenseCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await ExpenseCategory.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Categoría de gasto no encontrada' });
    }
    res.json({ success: true, message: 'Categoría de gasto actualizada exitosamente' });
  } catch (error) {
    console.error('Error updating expense category:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar categoría de gasto', error: error.message });
  }
};

const deleteExpenseCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ExpenseCategory.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Categoría de gasto no encontrada' });
    }
    res.json({ success: true, message: 'Categoría de gasto eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting expense category:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar categoría de gasto', error: error.message });
  }
};

// --- Additional Expense Controllers for AdminExpenses Module ---

// Get detailed expenses with joins for AdminExpenses component
const getDetailedExpenses = async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.execute(`
      SELECT
        g.*,
        e.nombre as evento_nombre,
        p.nombre as proveedor_nombre,
        cg.nombre as categoria_nombre,
        u.nombre as usuario_nombre,
        COALESCE(SUM(pg.monto), 0) as monto_pagado,
        CASE
          WHEN COALESCE(SUM(pg.monto), 0) >= g.monto THEN 'pagado'
          WHEN COALESCE(SUM(pg.monto), 0) > 0 THEN 'parcial'
          ELSE 'pendiente'
        END as estado_pago
      FROM gastos g
      LEFT JOIN eventos e ON g.id_evento = e.id_evento
      LEFT JOIN proveedores p ON g.id_proveedor = p.id_proveedor
      LEFT JOIN categorias_gasto cg ON g.id_categoria_gasto = cg.id_categoria_gasto
      LEFT JOIN usuarios u ON g.id_usuario = u.id_usuario
      LEFT JOIN pagos_gastos pg ON g.id_gasto = pg.id_gasto
      GROUP BY g.id_gasto
      ORDER BY g.fecha_gasto DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error getting detailed expenses:', error);
    res.status(500).json({ success: false, message: 'Error al obtener gastos detallados', error: error.message });
  }
};

// Get payments for a specific expense
const getExpensePayments = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const [rows] = await db.execute(`
      SELECT pg.*, mp.nombre as metodo_pago
      FROM pagos_gastos pg
      LEFT JOIN metodos_pago mp ON pg.id_metodo_pago = mp.id_metodo_pago
      WHERE pg.id_gasto = ?
      ORDER BY pg.fecha_pago DESC
    `, [id]);
    res.json(rows);
  } catch (error) {
    console.error('Error getting expense payments:', error);
    res.status(500).json({ success: false, message: 'Error al obtener pagos del gasto', error: error.message });
  }
};

// Create payment for expense
const createExpensePayment = async (req, res) => {
  try {
    const db = getDB();
    const { id_gasto, monto, fecha_pago, metodo_pago, referencia, notas } = req.body;

    const [result] = await db.execute(
      'INSERT INTO pagos_gastos (id_gasto, monto, fecha_pago, id_metodo_pago, referencia, notas) VALUES (?, ?, ?, ?, ?, ?)',
      [id_gasto, monto, fecha_pago, metodo_pago, referencia || null, notas || null]
    );

    res.status(201).json({
      success: true,
      data: { id_pago_gasto: result.insertId, ...req.body },
      message: 'Pago de gasto creado exitosamente'
    });
  } catch (error) {
    console.error('Error creating expense payment:', error);
    res.status(500).json({ success: false, message: 'Error al crear pago de gasto', error: error.message });
  }
};

module.exports = {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getAllExpenseCategories,
  getExpenseCategoryById,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  getDetailedExpenses,
  getExpensePayments,
  createExpensePayment
};
