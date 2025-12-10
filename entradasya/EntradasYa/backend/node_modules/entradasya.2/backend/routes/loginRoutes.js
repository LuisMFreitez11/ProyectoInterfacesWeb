const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  register,
  login,
  registerAdminSecret,
  registerContadorSecret,
  createUser // 🔑 Importamos la función de creación
} = require('../controllers/loginController');

// ----------------------------
// AUTH PUBLIC
// ----------------------------
router.post('/register', register);
router.post('/login', login);

// SECRET ROUTES (Solo para el setup inicial)
router.post('/register-admin-secret', registerAdminSecret);
router.post('/register-contador-secret', registerContadorSecret);

// ---------------------------------------------
// ADMIN ROUTES (SOLO ROL 2)
// ---------------------------------------------

// 🔑 RUTA DE CREACIÓN PROTEGIDA (Usa el prefijo /api/auth)
router.post('/admin/user/create', authenticateToken, authorizeRoles(2), createUser); 

// Rutas de listado (Las que originalmente funcionaban)
router.get('/admin/users', authenticateToken, authorizeRoles(2), (req, res) => res.json({success:true}));
router.get('/admin/users/:id', authenticateToken, authorizeRoles(2), (req, res) => res.json({success:true}));

// ---------------------------------------------
// CONTADOR ROUTES (SOLO ROL 4)
// ---------------------------------------------
router.get('/panel-contador', authenticateToken, authorizeRoles(4), (req, res) => {
  res.json({ success: true, message: "Bienvenido al panel del contador" });
});

module.exports = router;