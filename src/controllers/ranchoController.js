// src/controllers/ranchoController.js
const db = require('../db');
const { format } = require('date-fns');

// Constantes de Regra
const VALOR_ADMIN = 8.00;
const VALOR_VISITANTE = 10.00;
const HORARIO_CORTE = 12; // 9h00

// Helper para calcular o consumo de dependentes
const calcularValorConsumo = async (associadoId, qtdDependentes) => {
    // 1. Buscar o tipo de serviço (Rua ou Administrativo)
    const [assocResult] = await db.promise().query(
        'SELECT tipoServico FROM associados WHERE id = ?', [associadoId]
    );
    
    if (assocResult.length === 0) throw new Error("Associado não encontrado.");

    const tipoServico = assocResult[0].tipoServico;
    
    // 2. Aplicar a Regra de Preço
    if (tipoServico === 'Rua') {
        // Regra de Negócio: Serviço de Rua é GRÁTIS (Titular)
        return { valorTotal: 0.00, tipoRefeicao: 'Rua_Gratuito', isento: true };
    } 
    
    // Regra de Negócio: Serviço Administrativo
    const valorTotal = VALOR_ADMIN + (qtdDependentes * VALOR_ADMIN);
    return { valorTotal: valorTotal, tipoRefeicao: 'Administrativo', isento: false };
};


// 1. Rota principal para registrar o consumo
exports.registrarConsumo = async (req, res) => {
    // Recebe dados do Associado OU do Visitante, além da quantidade
    const { associado_id, visitante_id, qtdDependentes = 0 } = req.body;
    const dataConsumo = format(new Date(), 'yyyy-MM-dd');
    const horaAtual = new Date().getHours();

    // 🛑 1. Regra de Corte (07:30 - 09:00)
    // Se a hora for MAIOR que 9h (HORARIO_CORTE), o pedido é recusado.
    if (horaAtual >= HORARIO_CORTE) {
        return res.status(403).json({ message: "❌ O horário limite para pedidos (09:00h) já foi excedido." });
    }
    // Nota: A checagem de 07:30 é feita no Front-end, mas o Back-end garante o corte final às 09:00.

    try {
        let valor, tipoRefeicao, pagoStatus;

        if (associado_id) {
            // Lógica para Associados (Rua/Admin)
            const result = await calcularValorConsumo(associado_id, qtdDependentes);
            valor = result.valorTotal;
            tipoRefeicao = result.tipoRefeicao;
            pagoStatus = result.isento ? 1 : 0; // Se isento (Rua), já é considerado Pago (1)
            
        } else if (visitante_id) {
            // Lógica para Visitantes (R$ 10,00)
            valor = VALOR_VISITANTE;
            tipoRefeicao = 'Visitante';
            pagoStatus = 0; // Visitante sempre precisa pagar (0)
        } else {
            return res.status(400).json({ message: "É necessário informar o associado_id ou visitante_id." });
        }

        // 2. Verificar se o consumo já foi registrado hoje
        const [consumoHoje] = await db.promise().query(
            'SELECT * FROM consumo_rancho WHERE (associado_id = ? OR visitante_id = ?) AND data_consumo = ?',
            [associado_id, visitante_id, dataConsumo]
        );
        if (consumoHoje.length > 0) {
             return res.status(400).json({ message: `Consumo para ${dataConsumo} já foi registrado.` });
        }

        // 3. Inserir na tabela 'consumo_rancho'
        const sql = `INSERT INTO consumo_rancho 
                     (data_consumo, associado_id, visitante_id, tipo_refeicao, qtd_titular, qtd_dependentes, valor_total, pago) 
                     VALUES (?, ?, ?, ?, 1, ?, ?, ?)`; // 1 é sempre o titular/visitante

        await db.promise().query(sql, [
            dataConsumo, associado_id, visitante_id, tipoRefeicao, qtdDependentes, valor, pagoStatus
        ]);

        res.status(201).json({ 
            message: 'Consumo registrado com sucesso! Aguardando pagamento.',
            valor_a_pagar: valor,
            status_pagamento: pagoStatus === 1 ? 'ISENTO' : 'PENDENTE'
        });

    } catch (error) {
        console.error('Erro geral ao registrar consumo:', error);
        res.status(500).json({ message: error.message || 'Erro interno no servidor.' });
    }
};

// 2. Rota para gerar o Relatório da Cozinha (Para o Painel Admin)
exports.gerarRelatorioCozinha = async (req, res) => {
    const dataRelatorio = format(new Date(), 'yyyy-MM-dd');
    
    try {
        // Consulta que soma todas as refeições previstas
        const [results] = await db.promise().query(`
            SELECT 
                SUM(qtd_titular) AS total_titular,
                SUM(qtd_dependentes) AS total_dependentes,
                SUM(qtd_titular + qtd_dependentes) AS total_refeicoes
            FROM consumo_rancho
            WHERE data_consumo = ?;
        `, [dataRelatorio]);
        
        const totais = results[0];

        // Consulta detalhada para o relatório (quem e quanto pagou)
        const [detalhes] = await db.promise().query(`
            SELECT 
                c.tipo_refeicao,
                c.valor_total,
                c.pago,
                COALESCE(a.nomeCompleto, v.nomeCompleto) AS nome_usuario,
                COALESCE(a.patente, 'N/A') AS patente
            FROM consumo_rancho c
            LEFT JOIN associados a ON c.associado_id = a.id
            LEFT JOIN visitantes v ON c.visitante_id = v.id
            WHERE c.data_consumo = ?
            ORDER BY c.tipo_refeicao;
        `, [dataRelatorio]);

        res.json({
            data: dataRelatorio,
            resumo: totais,
            detalhes: detalhes
        });
        
    } catch (error) {
        console.error('Erro ao gerar relatório de rancho:', error);
        res.status(500).json({ message: 'Falha ao gerar relatório.' });
    }
};