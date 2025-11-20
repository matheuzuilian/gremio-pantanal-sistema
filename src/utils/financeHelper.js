// src/utils/financeHelper.js
const db = require('../db');

// Constantes de Preço (Devem ser configuráveis no Painel Admin futuro, mas fixamos aqui por enquanto)
const VALOR_TITULAR = 50.00;
const VALOR_DEPENDENTE = 35.00;
const TETO_MAXIMO = 130.00;

/**
 * Calcula o valor da fatura de um associado, aplicando a regra do TETO de R$ 130,00.
 * @param {number} associadoId - O ID do associado titular.
 * @returns {number} O valor final da mensalidade.
 */
exports.calcularMensalidade = async (associadoId) => {
    try {
        // 1. Contar dependentes ativos
        const [results] = await db.promise().query(
            'SELECT COUNT(*) AS total_dependentes FROM dependentes WHERE associado_id = ? AND status = "Ativo"',
            [associadoId]
        );
        
        const count = results[0].total_dependentes;

        // 2. Aplicar a regra de cálculo
        let valorBruto = VALOR_TITULAR + (count * VALOR_DEPENDENTE);

        // 3. Aplicar a regra do TETO
        let valorFinal = Math.min(valorBruto, TETO_MAXIMO);

        // Retornamos o objeto completo para debug
        return {
            valorBruto: valorBruto,
            valorFinal: valorFinal,
            numDependentes: count
        };

    } catch (error) {
        console.error("Erro no cálculo da mensalidade:", error);
        throw new Error("Falha ao calcular mensalidade.");
    }
};