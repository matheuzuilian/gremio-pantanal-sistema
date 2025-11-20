// src/controllers/notificacaoController.js
const db = require('../db');
const { addDays, format } = require('date-fns');

// Simula o envio de e-mail/WhatsApp (na vida real, usaria uma API como SendGrid/Twilio)
const simularEnvio = (fatura, tipo) => {
    // Busca o e-mail do associado (Módulo 1) para simular o destinatário
    return new Promise((resolve, reject) => {
        db.query('SELECT email FROM associados WHERE id = ?', [fatura.associado_id], (err, results) => {
            if (err) return reject(err);
            const email = results[0] ? results[0].email : 'N/A';
            
            console.log(`\n\n[📢 NOTIFICAÇÃO ENVIADA - ${tipo}]`);
            console.log(`Destino: ${email}`);
            console.log(`Fatura: R$ ${fatura.valor_total} (Vencimento: ${fatura.data_vencimento})`);
            console.log(`Mensagem: Sua fatura está ${tipo}.\n`);
            resolve();
        });
    });
};


// 1. Envia notificações diárias (Simula o Cron Job)
exports.enviarNotificacoesDiarias = async (req, res) => {
    try {
        // Datas que precisamos (formato MySQL YYYY-MM-DD)
        const hoje = format(new Date(), 'yyyy-MM-dd');
        const dataVencimentoD2 = format(addDays(new Date(), 2), 'yyyy-MM-dd'); // D-2
        const dataVencimentoD1 = format(addDays(new Date(), -1), 'yyyy-MM-dd'); // D+1 (Vencida há 1 dia)

        // -----------------------------------------------------
        // A. Busca faturas que VENCEM EM 2 DIAS (D-2)
        // -----------------------------------------------------
        const [faturasD2] = await db.promise().query(
            "SELECT * FROM faturas WHERE data_vencimento = ? AND status = 'Pendente'",
            [dataVencimentoD2]
        );
        
        for (const fatura of faturasD2) {
            await simularEnvio(fatura, 'PREVENTIVA (VENCE EM 2 DIAS)');
        }

        // -----------------------------------------------------
        // B. Busca faturas que ESTÃO VENCIDAS (D+1)
        // -----------------------------------------------------
        const [faturasD1] = await db.promise().query(
            "SELECT * FROM faturas WHERE data_vencimento = ? AND status = 'Pendente'",
            [dataVencimentoD1]
        );

        for (const fatura of faturasD1) {
             await simularEnvio(fatura, 'ATRASO (VENCIDA HÁ 1 DIA)');
        }
        
        res.json({
            message: 'Rotina de notificação concluída.',
            enviadas_preventivas: faturasD2.length,
            enviadas_atraso: faturasD1.length,
        });

    } catch (error) {
        console.error('Erro na Rotina de Notificação:', error);
        res.status(500).json({ message: 'Falha no processo de notificação.' });
    }
};