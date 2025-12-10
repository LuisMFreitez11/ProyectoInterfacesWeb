const express = require('express');
const router = express.Router();
const {
  getAllProveedores,
  getProveedorById,
  createProveedor,
  updateProveedor,
  deleteProveedor
} = require('../controllers/adminController');

// Middleware de autenticación
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Todas las rutas requieren autenticación de admin
router.use(verifyToken);
router.use(requireAdmin);

// Rutas CRUD para proveedores
router.get('/', getAllProveedores);
router.get('/:id', getProveedorById);
router.post('/', createProveedor);
router.put('/:id', updateProveedor);
router.delete('/:id', deleteProveedor);

module.exports = router;
