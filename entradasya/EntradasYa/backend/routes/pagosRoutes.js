// routes/pagosRoutes.js
const express = require('express');
const router = express.Router();
const pagosController = require('../controllers/pagosController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// ------------------------- PAGOS -------------------------
router.get('/payments', pagosController.getAllPayments);
router.get('/payments/:id', pagosController.getPaymentById);
router.post('/payments', authorizeRoles([1, 2]), pagosController.createPayment);
router.put('/payments/:id', authorizeRoles([1, 2]), pagosController.updatePayment);
router.delete('/payments/:id', authorizeRoles([1]), pagosController.deletePayment);

// ------------------------- GASTOS -------------------------
router.get('/expenses', pagosController.getAllExpenses);
router.get('/expenses/:id', pagosController.getExpenseById);
router.post('/expenses', authorizeRoles([1, 2]), pagosController.createExpense);
router.put('/expenses/:id', authorizeRoles([1, 2]), pagosController.updateExpense);
router.delete('/expenses/:id', authorizeRoles([1]), pagosController.deleteExpense);

// ------------------------- MÉTODOS DE PAGO -------------------------
router.get('/payment-methods', pagosController.getAllPaymentMethods);
router.get('/payment-methods/:id', pagosController.getPaymentMethodById);
router.post('/payment-methods', authorizeRoles([2]), pagosController.createPaymentMethod);
router.put('/payment-methods/:id', authorizeRoles([2]), pagosController.updatePaymentMethod);
router.delete('/payment-methods/:id', authorizeRoles([2]), pagosController.deletePaymentMethod);

// ------------------------- CATEGORÍAS DE GASTO -------------------------
router.get('/expense-categories', pagosController.getAllExpenseCategories);

// ------------------------- TRANSACCIÓN COMPLETA -------------------------
router.post('/transaccion-completa', authorizeRoles([1, 2, 3]), pagosController.registrarTransaccionCompleta);

module.exports = router;