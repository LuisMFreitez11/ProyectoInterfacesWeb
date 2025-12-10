const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getAllExpenseCategories,
  getExpenseCategoryById,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory
} = require('../controllers/gastosController');

// Expense Routes
router.get('/expenses', authenticateToken, authorizeRoles(1, 2), getAllExpenses); // Admin/Organizer
router.get('/expenses/:id', authenticateToken, authorizeRoles(1, 2), getExpenseById); // Admin/Organizer
router.post('/expenses', authenticateToken, authorizeRoles(1, 2), createExpense); // Admin/Organizer
router.put('/expenses/:id', authenticateToken, authorizeRoles(1, 2), updateExpense); // Admin/Organizer
router.delete('/expenses/:id', authenticateToken, authorizeRoles(1), deleteExpense); // Admin only

// ExpenseCategory Routes
router.get('/expense-categories', authenticateToken, authorizeRoles(1, 2), getAllExpenseCategories); // Admin/Organizer
router.get('/expense-categories/:id', authenticateToken, authorizeRoles(1, 2), getExpenseCategoryById); // Admin/Organizer
router.post('/expense-categories', authenticateToken, authorizeRoles(1), createExpenseCategory); // Admin only
router.put('/expense-categories/:id', authenticateToken, authorizeRoles(1), updateExpenseCategory); // Admin only
router.delete('/expense-categories/:id', authenticateToken, authorizeRoles(1), deleteExpenseCategory); // Admin only

module.exports = router;
