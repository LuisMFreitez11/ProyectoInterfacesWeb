const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getFinancialSummary,
  getSalesRevenue,
  getExpensesCosts,
  getBankReconciliation,
  generateFinancialReport
} = require('../controllers/contadorController');

// Todas las rutas requieren autenticación y rol de Contador (4)
const contadorAuth = [authenticateToken, authorizeRoles(4)];

// Dashboard - Resumen Financiero
router.get('/dashboard/summary', contadorAuth, getFinancialSummary);

// Ingresos y Ventas
router.get('/sales/summary', contadorAuth, getSalesRevenue);
router.get('/sales/by-event', contadorAuth, (req, res) => {
  req.query.type = 'by_event';
  getSalesRevenue(req, res);
});
router.get('/sales/by-payment-method', contadorAuth, (req, res) => {
  req.query.type = 'by_payment_method';
  getSalesRevenue(req, res);
});

// Gastos y Costos Operacionales
router.get('/expenses/by-category', contadorAuth, (req, res) => {
  req.query.type = 'by_category';
  getExpensesCosts(req, res);
});
router.get('/expenses/by-event', contadorAuth, (req, res) => {
  req.query.type = 'by_event';
  getExpensesCosts(req, res);
});
router.get('/expenses/timeline', contadorAuth, (req, res) => {
  req.query.type = 'timeline';
  getExpensesCosts(req, res);
});

// Conciliación Bancaria y Movimientos Contables
router.get('/reconciliation/pending', contadorAuth, (req, res) => {
  req.query.type = 'pending_movements';
  getBankReconciliation(req, res);
});
router.get('/reconciliation/summary', contadorAuth, (req, res) => {
  req.query.type = 'reconciled_summary';
  getBankReconciliation(req, res);
});
router.get('/reconciliation/by-type', contadorAuth, (req, res) => {
  req.query.type = 'movements_by_type';
  getBankReconciliation(req, res);
});

// Reportes y Documentación
router.post('/reports/generate', contadorAuth, generateFinancialReport);

module.exports = router;
