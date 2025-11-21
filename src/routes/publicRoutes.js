// src/routes/publicRoutes.js
const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Rotas abertas (qualquer um acessa)
router.get('/noticias', publicController.getNoticias);
router.get('/diretoria', publicController.getDiretoria);
router.get('/projetos', publicController.getProjetos);

module.exports = router;