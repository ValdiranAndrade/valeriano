// Configuração do Mercado Pago
const mercadopago = require('mercadopago');
require('dotenv').config();

// Configurar credenciais
mercadopago.configurations.setAccessToken(process.env.MERCADOPAGO_ACCESS_TOKEN);

// Configurar preferências adicionais
if (process.env.MERCADOPAGO_MODE === 'sandbox') {
    console.log('🔧 Modo SANDBOX (Teste) ativado');
} else {
    console.log('🚀 Modo PRODUÇÃO ativado');
}

module.exports = mercadopago;

