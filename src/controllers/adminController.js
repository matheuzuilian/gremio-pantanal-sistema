const db = require('../db');
const bcrypt = require('bcryptjs');

exports.criarNoticia = async (req, res) => {
    const { titulo, conteudo, status } = req.body;
    try {
        const sql = "INSERT INTO noticias (titulo, conteudo, status) VALUES (?, ?, ?)";
        await db.promise().query(sql, [titulo, conteudo, status || 'Rascunho']);
        res.status(201).json({ message: 'Notícia criada!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar notícia' });
    }
};

// Listar todos os membros (com seus dependentes contados)

exports.listarMembros = async (req, res) => {
    try {
        const sql = `
            SELECT a.id, a.nomeCompleto, a.patente, a.status, 
            (SELECT COUNT(*) FROM dependentes d WHERE d.associado_id = a.id) as total_dependentes
            FROM associados a
            ORDER BY a.nomeCompleto ASC
        `;
        const [rows] = await db.promise().query(sql);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar membros.' });
    }
};

// Remover membro (e seus dependentes via CASCADE)
exports.removerMembro = async (req, res) => {
    const { id } = req.params;
    try {
        await db.promise().query("DELETE FROM associados WHERE id = ?", [id]);
        res.json({ message: 'Membro removido com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover membro.' });
    }
};

// Adicionar Projeto
exports.adicionarProjeto = async (req, res) => {
    const { titulo, descricao, status, imagem_url } = req.body;
    try {
        const sql = "INSERT INTO projetos (titulo, descricao, status, imagem_url) VALUES (?, ?, ?, ?)";
        await db.promise().query(sql, [titulo, descricao, status, imagem_url]);
        res.status(201).json({ message: 'Projeto adicionado!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar projeto.' });
    }
};

// Remover Projeto
exports.removerProjeto = async (req, res) => {
    const { id } = req.params;
    try {
        await db.promise().query("DELETE FROM projetos WHERE id = ?", [id]);
        res.json({ message: 'Projeto removido.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover.' });
    }
};

// Cadastrar NOVO ADMINISTRADOR
exports.cadastrarAdmin = async (req, res) => {
    const { nomeCompleto, cpf, email, senha, patente } = req.body;

    if (!nomeCompleto || !cpf || !senha) {
        return res.status(400).json({ message: 'Dados incompletos.' });
    }

    try {
        // 1. Criptografar senha
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        // 2. Inserir forçando perfil = 'admin' e tipoServico = 'Administrativo'
        const sql = `INSERT INTO associados 
                     (nomeCompleto, cpf, email, senha_hash, patente, perfil, tipoServico) 
                     VALUES (?, ?, ?, ?, ?, 'admin', 'Administrativo')`;
        
        await db.promise().query(sql, [nomeCompleto, cpf, email, senhaHash, patente]);
        
        res.status(201).json({ message: 'Novo Administrador cadastrado com sucesso!' });

    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Erro: CPF ou Email já cadastrados.' });
        }
        res.status(500).json({ message: 'Erro ao cadastrar administrador.' });
    }
};