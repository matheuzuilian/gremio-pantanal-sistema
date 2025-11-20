// src/controllers/dependenteController.js
const db = require('../db');

// 1. Listar dependentes de um associado específico
exports.listarPorAssociado = (req, res) => {
    const { idAssociado } = req.params; // Pega o ID da URL

    const sql = 'SELECT * FROM dependentes WHERE associado_id = ?';
    
    db.query(sql, [idAssociado], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar dependentes.' });
        }
        res.json(results);
    });
};

// 2. Adicionar um novo dependente
exports.adicionarDependente = (req, res) => {
    const { associado_id, nomeCompleto, dataNascimento, grauParentesco } = req.body;

    const sql = `INSERT INTO dependentes 
                 (associado_id, nomeCompleto, dataNascimento, grauParentesco) 
                 VALUES (?, ?, ?, ?)`;

    const valores = [associado_id, nomeCompleto, dataNascimento, grauParentesco];

    db.query(sql, valores, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erro ao adicionar dependente.' });
        }
        res.status(201).json({ message: 'Dependente adicionado!', id: result.insertId });
    });
};