// src/controllers/publicController.js
const db = require('../db');

// 1. Listar Notícias Publicadas (Para a Home/Notícias)
exports.getNoticias = async (req, res) => {
    try {
        // Pega apenas as publicadas, ordenadas pela mais recente
        const [rows] = await db.promise().query(
            "SELECT * FROM noticias WHERE status = 'Publicado' ORDER BY criado_em DESC"
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar notícias.' });
    }
};

// 2. Listar Diretoria (Para o Sobre Nós)
exports.getDiretoria = async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            "SELECT * FROM diretoria ORDER BY ordem ASC"
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar diretoria.' });
    }
};

// 3. Listar Projetos (Para o Sobre Nós)
exports.getProjetos = async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            "SELECT * FROM projetos ORDER BY id DESC"
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar projetos.' });
    }
};