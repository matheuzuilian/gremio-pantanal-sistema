// src/routes/associadoRoutes.js
const express = require('express');
const router = express.Router();
const associadoController = require('../controllers/associadoController');

// Quando alguém acessar '/api/associados' com GET -> Lista todos
router.get('/', associadoController.listarAssociados);

// Quando alguém acessar '/api/associados' com POST -> Cria um novo
router.post('/', associadoController.criarAssociado);

module.exports = router;