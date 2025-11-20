// src/routes/notificacaoRoutes.js
const express = require('express');
const router = express.Router();
const notificacaoController = require('../controllers/notificacaoController');

// Rota para acionar a rotina de envio diário
router.get('/enviar-diario', notificacaoController.enviarNotificacoesDiarias);

module.exports = router;