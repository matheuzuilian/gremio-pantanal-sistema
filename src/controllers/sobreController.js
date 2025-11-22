// src/controllers/sobreController.js
const db = require('../db');

// Listar Diretoria (Público e Admin usam)
exports.listarDiretoria = async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT * FROM diretoria ORDER BY ordem ASC");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar diretoria.' });
    }
};

// Adicionar Diretor (Só Admin)
exports.adicionarDiretor = async (req, res) => {
    const { nome, cargo, foto_url, ordem } = req.body;
    try {
        const sql = "INSERT INTO diretoria (nome, cargo, foto_url, ordem) VALUES (?, ?, ?, ?)";
        await db.promise().query(sql, [nome, cargo, foto_url, ordem || 99]);
        res.status(201).json({ message: 'Diretor adicionado!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar diretor.' });
    }
};

// Remover Diretor (Só Admin)
exports.removerDiretor = async (req, res) => {
    const { id } = req.params;
    try {
        await db.promise().query("DELETE FROM diretoria WHERE id = ?", [id]);
        res.json({ message: 'Diretor removido.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover.' });
    }
};