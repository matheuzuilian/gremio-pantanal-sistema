const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// POST: Criar Notícia
router.post('/noticias', adminController.criarNoticia);
router.get('/membros', adminController.listarMembros);
router.delete('/membros/:id', adminController.removerMembro);

module.exports = router;