const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/adminController');

router.get('/', authenticateToken, authorizeRoles(1, 2), getAllUsers);
router.get('/:id', authenticateToken, authorizeRoles(1, 2), getUserById);
router.post('/', authenticateToken, authorizeRoles(1, 2), createUser);
router.put('/:id', authenticateToken, authorizeRoles(1, 2), updateUser);
router.delete('/:id', authenticateToken, authorizeRoles(1, 2), deleteUser);

module.exports = router;