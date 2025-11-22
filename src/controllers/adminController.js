const db = require('../db');

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