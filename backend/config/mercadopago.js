// Configuração do Mercado Pago
const { MercadoPagoConfig, Payment } = require('mercadopago');
require('dotenv').config();

// Configurar credenciais
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    options: {
        timeout: 5000,
        idempotencyKey: 'abc'
    }
});

// Configurar preferências adicionais
const mode = process.env.MERCADOPAGO_MODE || 'sandbox';
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || '';

if (mode === 'production') {
    // Validar credenciais de produção
    if (accessToken.startsWith('TEST-')) {
        console.error('❌ ERRO: Modo PRODUÇÃO mas usando credenciais de TESTE!');
        throw new Error('Credenciais de teste não podem ser usadas em produção');
    }
    console.log('🚀 Modo PRODUÇÃO ativado - Pagamentos REAIS');
} else {
    console.log('🔧 Modo SANDBOX (Teste) ativado');
}

// Exportar cliente e Payment
module.exports = {
    client,
    Payment
};

