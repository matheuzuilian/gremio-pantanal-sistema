// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs'); // Garanta que instalou: npm install bcryptjs

// ROTA 1: CADASTRO (Criptografando senha)
router.post('/register', async (req, res) => {
    const { nomeCompleto, cpf, email, senha, patente, tipoServico } = req.body;

    if (!nomeCompleto || !cpf || !senha) {
        return res.status(400).json({ message: 'Dados incompletos.' });
    }

    try {
        // Criptografa a senha antes de salvar
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        const sql = `INSERT INTO associados (nomeCompleto, cpf, email, senha_hash, patente, tipoServico) VALUES (?, ?, ?, ?, ?, ?)`;
        
        await db.promise().query(sql, [nomeCompleto, cpf, email, senhaHash, patente, tipoServico]);
        res.status(201).json({ message: 'Associado cadastrado com sucesso!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar.' });
    }
});

// ROTA 2: LOGIN (Verificando senha)
router.post('/login', async (req, res) => {
    const { cpf, senha } = req.body;

    try {
        const [users] = await db.promise().query('SELECT * FROM associados WHERE cpf = ?', [cpf]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'CPF não cadastrado.' });
        }

        const user = users[0];
        // Compara a senha digitada com a criptografada
        const isMatch = await bcrypt.compare(senha, user.senha_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Senha incorreta.' });
        }

        res.json({
            message: 'Login realizado!',
            user: { 
                id: user.id, 
                nome: user.nomeCompleto, 
                patente: user.patente, 
                status: user.status, 
                tipoServico: user.tipoServico, 
                perfil: user.perfil}
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
});

module.exports = router;