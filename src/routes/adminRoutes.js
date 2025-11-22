const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// POST: Criar Notícia
router.post('/noticias', adminController.criarNoticia);

module.exports = router;