// reportesRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

console.log('*** DIAGNÓSTICO: reportesRoutes.js cargado exitosamente ***');

// 🔑 CORRECCIÓN: Usar 'reporteController' (singular)
// Asegúrate que la ruta sea correcta. (Debe estar en: backend/controllers/reporteController.js)
const {
    getSummary,
    getSalesReport,
    getExpensesReport,
    getEventsReport,
    getTrendData,
    getPaymentDistribution
} = require('../controllers/reporteController');

// --------------------------------------------------
// Mapeo de las rutas (Endpoints GET) - Protegidas para Admin (2) y Contador (4)
// --------------------------------------------------

router.get('/summary', authenticateToken, authorizeRoles(2, 4), getSummary);
router.get('/sales', authenticateToken, authorizeRoles(2, 4), getSalesReport);
router.get('/expenses', authenticateToken, authorizeRoles(2, 4), getExpensesReport);
router.get('/events', authenticateToken, authorizeRoles(2, 4), getEventsReport);
router.get('/trend', authenticateToken, authorizeRoles(2, 4), getTrendData);
router.get('/payment-distribution', authenticateToken, authorizeRoles(2, 4), getPaymentDistribution);

module.exports = router;