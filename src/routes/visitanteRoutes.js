// src/routes/visitanteRoutes.js
const express = require('express');
const router = express.Router();
const visitanteController = require('../controllers/visitanteController');

// POST: Cadastro de um novo visitante (Secretaria)
router.post('/', visitanteController.cadastrarVisitante);

// GET: Lista todos os visitantes (Painel Admin)
router.get('/', visitanteController.listarVisitantes);

module.exports = router;