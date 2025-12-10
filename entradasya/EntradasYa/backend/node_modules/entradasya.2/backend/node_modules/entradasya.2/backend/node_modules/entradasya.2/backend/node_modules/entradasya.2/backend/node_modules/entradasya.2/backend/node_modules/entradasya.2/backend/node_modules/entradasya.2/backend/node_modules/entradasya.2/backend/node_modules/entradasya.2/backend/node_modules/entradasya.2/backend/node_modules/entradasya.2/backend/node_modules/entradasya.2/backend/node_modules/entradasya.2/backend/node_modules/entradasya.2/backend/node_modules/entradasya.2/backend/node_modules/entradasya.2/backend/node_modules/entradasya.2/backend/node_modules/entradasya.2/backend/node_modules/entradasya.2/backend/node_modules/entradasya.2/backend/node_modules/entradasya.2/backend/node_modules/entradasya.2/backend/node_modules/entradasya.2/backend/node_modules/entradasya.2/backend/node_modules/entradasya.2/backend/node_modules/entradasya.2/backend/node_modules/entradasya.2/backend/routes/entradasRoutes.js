const express = require('express');
const router = express.Router();
const {
  getAllEntradas,
  getEntradaById,
  createEntrada,
  updateEntrada,
  deleteEntrada
} = require('../controllers/entradasController');

// Rutas de entradas
router.get('/', getAllEntradas);
router.get('/:id', getEntradaById);
router.post('/', createEntrada);
router.put('/:id', updateEntrada);
router.delete('/:id', deleteEntrada);

module.exports = router;
