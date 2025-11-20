// src/controllers/visitanteController.js
const db = require('../db');
const { addDays, format } = require('date-fns');

// 1. Função para cadastrar o Visitante (Feito pela Secretaria)
exports.cadastrarVisitante = async (req, res) => {
    const { nomeCompleto, cpf, unidade_origem, data_chegada } = req.body;

    // 1. Regra de Negócio: Calcular Expiração (data_chegada + 15 dias)
    // O sistema precisa de datas no formato 'yyyy-MM-dd' para o MySQL
    const dataChegada = new Date(data_chegada);
    const dataExpiracao = format(addDays(dataChegada, 15), 'yyyy-MM-dd');

    if (!nomeCompleto || !cpf || !data_chegada) {
        return res.status(400).json({ message: 'Nome, CPF e Data de Chegada são obrigatórios.' });
    }

    try {
        // 2. Inserir na tabela 'visitantes'
        const sql = `INSERT INTO visitantes 
                     (nomeCompleto, cpf, unidade_origem, data_chegada, data_expiracao, status) 
                     VALUES (?, ?, ?, ?, ?, 'Ativo')`;

        const valores = [nomeCompleto, cpf, unidade_origem, data_chegada, dataExpiracao];

        await db.promise().query(sql, valores);

        res.status(201).json({ 
            message: 'Visitante cadastrado com sucesso!', 
            data_expiracao_automatica: dataExpiracao
        });

    } catch (error) {
        console.error('Erro ao cadastrar visitante:', error);
        // Erro 1062 é DUPLICATE ENTRY (CPF já existe)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Erro: CPF de Visitante já existe no sistema.' });
        }
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

// 2. Rota para listar visitantes (para o Painel Admin)
exports.listarVisitantes = async (req, res) => {
    try {
        const [results] = await db.promise().query('SELECT * FROM visitantes');
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar lista de visitantes.' });
    }
};