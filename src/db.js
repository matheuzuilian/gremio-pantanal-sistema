// src/db.js
const mysql = require('mysql2');
require('dotenv').config(); // Carrega as senhas do arquivo .env

// Cria a conexão com as configurações do .env
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// Tenta conectar
connection.connect((err) => {
    if (err) {
        console.error('❌ Erro ao conectar no MySQL: ' + err.stack);
        return;
    }
    console.log('✅ Conectado ao MySQL com sucesso! ID da conexão: ' + connection.threadId);
});

module.exports = connection;