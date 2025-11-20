// src/routes/faturaRoutes.js
const express = require('express');
const router = express.Router();
const faturaController = require('../controllers/faturaController');

// Rota para GERAÇÃO MANUAL (TESTE): POST /api/faturas/gerar/1
router.post('/gerar/:idAssociado', faturaController.gerarFaturaTeste);

// Rota para GERAÇÃO EM MASSA (Cron Job): POST /api/faturas/gerar-todos
router.post('/gerar-todos', faturaController.gerarTodasFaturas);

// GET: Lista todas as faturas (Painel Admin)
router.get('/', faturaController.listarFaturas);

// PATCH/PUT: Marca uma fatura como paga
router.patch('/pagar/:id', faturaController.marcarComoPaga);

module.exports = router;