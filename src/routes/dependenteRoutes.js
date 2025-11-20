// src/routes/dependenteRoutes.js
const express = require('express');
const router = express.Router();
const dependenteController = require('../controllers/dependenteController');

// Rota para adicionar: POST /api/dependentes
router.post('/', dependenteController.adicionarDependente);

// Rota para listar: GET /api/dependentes/associado/1 (onde 1 é o ID do titular)
router.get('/associado/:idAssociado', dependenteController.listarPorAssociado);

module.exports = router;