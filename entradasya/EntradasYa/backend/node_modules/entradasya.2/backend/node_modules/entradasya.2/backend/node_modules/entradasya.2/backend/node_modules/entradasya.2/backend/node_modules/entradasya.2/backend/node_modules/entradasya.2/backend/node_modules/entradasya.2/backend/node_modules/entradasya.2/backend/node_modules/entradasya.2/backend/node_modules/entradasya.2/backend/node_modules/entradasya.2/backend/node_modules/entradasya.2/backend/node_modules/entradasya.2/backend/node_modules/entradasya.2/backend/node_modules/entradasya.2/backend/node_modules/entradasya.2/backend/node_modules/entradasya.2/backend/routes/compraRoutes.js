const express = require('express');
const router = express.Router();
const compraController = require('../controllers/compraController');

// La ruta que tu frontend está llamando
router.post('/', compraController.registrarCompraCompleta);
module.exports = router;