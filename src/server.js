// src/server.js
const express = require('express');
const cors = require('cors');
const db = require('./db'); 

// Importa as rotas que acabamos de criar
const associadoRoutes = require('./routes/associadoRoutes');
const dependenteRoutes = require('./routes/dependenteRoutes'); 
const faturaRoutes = require('./routes/faturaRoutes'); 
const visitanteRoutes = require('./routes/visitanteRoutes'); 
const ranchoRoutes = require('./routes/ranchoRoutes');
const notificacaoRoutes = require('./routes/notificacaoRoutes');
const authRoutes = require('./routes/authRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json()); // Importante para ler JSON no POST

// --- NOVO: Dedo Duro ---
app.use((req, res, next) => {
    console.log(`>>Recebi um pedido: ${req.method} em ${req.url}`);
    next();
});

// Rota de teste simples
app.get('/', (req, res) => {
    res.send('Servidor do Grêmio Pantanal está ON-LINE!');
});

// --- CONFIGURAÇÃO DAS ROTAS DA API ---
// Todo endereço que começar com /api/associados vai para o nosso arquivo de rotas
app.use('/api/associados', associadoRoutes);
app.use('/api/dependentes', dependenteRoutes);  
app.use('/api/faturas', faturaRoutes);
app.use('/api/visitantes', visitanteRoutes);
app.use('/api/rancho', ranchoRoutes);
app.use('/api/notificacoes', notificacaoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);

app.listen(PORT, () => {
    console.log(`🔥Servidor rodando na porta ${PORT}`);
    console.log(`Rotas disponíveis em: http://localhost:${PORT}/api/associados`);
});