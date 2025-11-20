// src/routes/ranchoRoutes.js
const express = require('express');
const router = express.Router();
const ranchoController = require('../controllers/ranchoController');

// POST: Registrar consumo de almoço (Titular/Visitante)
router.post('/consumo', ranchoController.registrarConsumo);

// GET: Relatório para a cozinha (Painel Admin)
router.get('/relatorio', ranchoController.gerarRelatorioCozinha);

module.exports = router;