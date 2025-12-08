// routes/tiposEntradaRoutes.js
const express = require('express');
const router = express.Router();
const {
  getTiposEntradaByEvento,
  getTipoEntradaById,
  createTipoEntrada,
  updateTipoEntrada,
  deleteTipoEntrada
} = require('../controllers/tiposEntradaController');

// Rutas de tipos de entrada (Zonas)

// Obtener todas las zonas de un evento (usado en AdminEvents para el modal)
router.get('/evento/:id_evento', getTiposEntradaByEvento);

// Rutas CRUD estándar para un tipo de entrada
router.get('/:id', getTipoEntradaById);
router.post('/', createTipoEntrada);
router.put('/:id', updateTipoEntrada);
router.delete('/:id', deleteTipoEntrada);

module.exports = router;