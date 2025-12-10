const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getAllUsers,
  updateUser,
  deleteUser,
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getDashboardStats,
  getReports
} = require('../controllers/adminController');

// SOLO ADMIN ROL 2
router.get('/users', authenticateToken, authorizeRoles(2), getAllUsers);
router.put('/users/:id', authenticateToken, authorizeRoles(2), updateUser);
router.delete('/users/:id', authenticateToken, authorizeRoles(2), deleteUser);

// Events
router.get('/events', authenticateToken, authorizeRoles(2), getAllEvents);
router.get('/events/:id', authenticateToken, authorizeRoles(2), getEventById);
router.post('/events', authenticateToken, authorizeRoles(2), createEvent);
router.put('/events/:id', authenticateToken, authorizeRoles(2), updateEvent);
router.delete('/events/:id', authenticateToken, authorizeRoles(2), deleteEvent);

// Payments
router.get('/payments', authenticateToken, authorizeRoles(2), getAllPayments);
router.get('/payments/:id', authenticateToken, authorizeRoles(2), getPaymentById);
router.post('/payments', authenticateToken, authorizeRoles(2), createPayment);
router.put('/payments/:id', authenticateToken, authorizeRoles(2), updatePayment);
router.delete('/payments/:id', authenticateToken, authorizeRoles(2), deletePayment);

// Expenses
router.get('/expenses', authenticateToken, authorizeRoles(2), getAllExpenses);
router.get('/expenses/:id', authenticateToken, authorizeRoles(2), getExpenseById);
router.post('/expenses', authenticateToken, authorizeRoles(2), createExpense);
router.put('/expenses/:id', authenticateToken, authorizeRoles(2), updateExpense);
router.delete('/expenses/:id', authenticateToken, authorizeRoles(2), deleteExpense);

// Dashboard Stats
router.get('/dashboard-stats', authenticateToken, authorizeRoles(2), getDashboardStats);

// Reports
router.get('/reports', authenticateToken, authorizeRoles(2), getReports);

module.exports = router;
