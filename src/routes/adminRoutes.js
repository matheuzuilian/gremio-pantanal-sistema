const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const sobreController = require('../controllers/sobreController');

// POST: Criar Notícia
router.post('/noticias', adminController.criarNoticia);
router.get('/membros', adminController.listarMembros);
router.delete('/membros/:id', adminController.removerMembro);
router.post('/diretoria', sobreController.adicionarDiretor);
router.delete('/diretoria/:id', sobreController.removerDiretor);
router.post('/projetos', adminController.adicionarProjeto);
router.delete('/projetos/:id', adminController.removerProjeto);

module.exports = router;