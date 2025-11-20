// src/controllers/associadoController.js
const db = require('../db'); // Importa a conexão com o banco

// 1. Função para LISTAR todos os associados
exports.listarAssociados = (req, res) => {
    const sql = 'SELECT * FROM associados';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar:', err);
            return res.status(500).json({ error: 'Erro interno no banco de dados' });
        }
        // Retorna a lista em formato JSON
        res.json(results);
    });
};

// 2. Função para CRIAR um novo associado
exports.criarAssociado = (req, res) => {
    // Recebe os dados que virão do Front-end (ou teste)
    const { nomeCompleto, cpf, email, senha, patente, tipoServico } = req.body;

    // SQL de Inserção
    const sql = `INSERT INTO associados 
                 (nomeCompleto, cpf, email, senha, patente, tipoServico) 
                 VALUES (?, ?, ?, ?, ?, ?)`;

    const valores = [nomeCompleto, cpf, email, senha, patente, tipoServico];

    db.query(sql, valores, (err, result) => {
        if (err) {
            console.error('Erro ao inserir:', err);
            return res.status(500).json({ error: 'Erro ao cadastrar associado. Verifique CPF/Email duplicado.' });
        }
        res.status(201).json({ message: 'Associado cadastrado com sucesso!', id: result.insertId });
    });
};