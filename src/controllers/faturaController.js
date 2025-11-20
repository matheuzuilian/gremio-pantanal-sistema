// src/controllers/faturaController.js
const db = require('../db');
const { calcularMensalidade } = require('../utils/financeHelper');
const { format } = require('date-fns'); // Necessário para formatar a data

// 1. Gera uma fatura de teste para um dado associado
exports.gerarFaturaTeste = async (req, res) => {
    const associado_id = parseInt(req.params.idAssociado);

    if (isNaN(associado_id)) {
        return res.status(400).json({ message: 'ID do Associado inválido.' });
    }

    try {
        // 1. Chamada à Lógica Central
        const { valorFinal } = await calcularMensalidade(associado_id);

        // 2. Definir dados da fatura
        const mesReferencia = format(new Date(), 'MM/yyyy'); // Ex: 11/2025
        const dataVencimento = format(new Date(), 'yyyy-MM-dd'); // Simplificado para teste

        // 3. Inserir na tabela 'faturas'
        const sql = `INSERT INTO faturas 
                     (associado_id, mes_referencia, valor_total, data_vencimento) 
                     VALUES (?, ?, ?, ?)`;
        
        await db.promise().query(sql, [associado_id, mesReferencia, valorFinal, dataVencimento]);

        res.status(201).json({ 
            message: `Fatura gerada com sucesso para ID ${associado_id}!`, 
            valor_calculado: valorFinal 
        });

    } catch (error) {
        console.error('Erro na Geração da Fatura:', error);
        res.status(500).json({ message: error.message });
    }
};

// Rota 3. Gera faturas para TODOS os associados ativos (Simula o Cron Job)
exports.gerarTodasFaturas = async (req, res) => {
    try {
        // 1. Encontrar todos os IDs de associados ativos
        const [associados] = await db.promise().query(
            "SELECT id FROM associados WHERE status = 'Ativo'"
        );

        const mesReferencia = format(new Date(), 'MM/yyyy');
        const dataVencimento = format(new Date(), 'yyyy-MM-dd');
        let faturasGeradas = 0;

        // 2. Loop para gerar a fatura para CADA associado
        for (const associado of associados) {
            const associado_id = associado.id;
            
            // Verifica se a fatura para este mês já existe (evita duplicidade)
            const [existingFatura] = await db.promise().query(
                "SELECT id FROM faturas WHERE associado_id = ? AND mes_referencia = ?",
                [associado_id, mesReferencia]
            );

            if (existingFatura.length === 0) {
                // Chama a lógica de cálculo (R$50/R$35/Teto R$130)
                const { valorFinal } = await calcularMensalidade(associado_id);

                const sql = `INSERT INTO faturas 
                             (associado_id, mes_referencia, valor_total, data_vencimento) 
                             VALUES (?, ?, ?, ?)`;
                
                await db.promise().query(sql, [associado_id, mesReferencia, valorFinal, dataVencimento]);
                faturasGeradas++;
            }
        }

        res.json({
            message: 'Processo de Geração de Faturas concluído.',
            total_associados_ativos: associados.length,
            faturas_geradas_neste_ciclo: faturasGeradas
        });

    } catch (error) {
        console.error('Erro no Cron Job de Faturas:', error);
        res.status(500).json({ message: 'Falha na geração em massa de faturas.' });
    }
};

// 4. Função para marcar uma fatura como paga
exports.marcarComoPaga = async (req, res) => {
    const faturaId = parseInt(req.params.id);

    if (isNaN(faturaId)) {
        return res.status(400).json({ message: 'ID da fatura inválido.' });
    }

    try {
        const [result] = await db.promise().query(
            "UPDATE faturas SET status = 'Pago', data_pagamento = CURDATE() WHERE id = ? AND status = 'Pendente'",
            [faturaId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Fatura não encontrada ou já estava paga.' });
        }

        res.json({ message: `Fatura ${faturaId} marcada como PAGA com sucesso!` });

    } catch (error) {
        console.error('Erro ao marcar fatura como paga:', error);
        res.status(500).json({ message: 'Erro no servidor ao atualizar o status.' });
    }
};

// 5. Função para listar todas as faturas (para o painel)
exports.listarFaturas = async (req, res) => {
    try {
        const [faturas] = await db.promise().query("SELECT * FROM faturas ORDER BY data_vencimento DESC");
        res.json(faturas);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar lista de faturas.' });
    }
};