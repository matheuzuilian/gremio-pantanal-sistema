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