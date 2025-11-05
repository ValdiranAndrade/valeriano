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
if (process.env.MERCADOPAGO_MODE === 'sandbox') {
    console.log('🔧 Modo SANDBOX (Teste) ativado');
} else {
    console.log('🚀 Modo PRODUÇÃO ativado');
}

// Exportar cliente e Payment
module.exports = {
    client,
    Payment
};

