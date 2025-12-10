const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getAllAccountingMovements,
  getAccountingMovementById,
  createAccountingMovement,
  updateAccountingMovement,
  deleteAccountingMovement
} = require('../controllers/movimientosContablesController');

// Routes
router.get('/', authenticateToken, authorizeRoles(1), getAllAccountingMovements); // Admin only
router.get('/:id', authenticateToken, authorizeRoles(1), getAccountingMovementById); // Admin only
router.post('/', authenticateToken, authorizeRoles(1), createAccountingMovement); // Admin only
router.put('/:id', authenticateToken, authorizeRoles(1), updateAccountingMovement); // Admin only
router.delete('/:id', authenticateToken, authorizeRoles(1), deleteAccountingMovement); // Admin only

module.exports = router;
