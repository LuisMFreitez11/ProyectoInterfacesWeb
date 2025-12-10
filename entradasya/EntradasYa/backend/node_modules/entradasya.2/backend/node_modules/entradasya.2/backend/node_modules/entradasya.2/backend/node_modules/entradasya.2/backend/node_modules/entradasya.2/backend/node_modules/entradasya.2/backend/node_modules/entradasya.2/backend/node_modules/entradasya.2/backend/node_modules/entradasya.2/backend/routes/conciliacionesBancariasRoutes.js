const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getAllBankReconciliations,
  getBankReconciliationById,
  createBankReconciliation,
  updateBankReconciliation,
  deleteBankReconciliation
} = require('../controllers/conciliacionesBancariasController');

// Routes
router.get('/', authenticateToken, authorizeRoles(1), getAllBankReconciliations); // Admin only
router.get('/:id', authenticateToken, authorizeRoles(1), getBankReconciliationById); // Admin only
router.post('/', authenticateToken, authorizeRoles(1), createBankReconciliation); // Admin only
router.put('/:id', authenticateToken, authorizeRoles(1), updateBankReconciliation); // Admin only
router.delete('/:id', authenticateToken, authorizeRoles(1), deleteBankReconciliation); // Admin only

module.exports = router;
