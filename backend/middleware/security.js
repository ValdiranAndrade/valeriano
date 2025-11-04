// Middleware de segurança
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Configurar Helmet para segurança HTTP
const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "https://sdk.mercadopago.com"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
});

// Rate limiting para prevenir abuso
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requisições por IP
    message: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting específico para pagamentos (mais restritivo)
const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // máximo 10 tentativas de pagamento
    message: 'Muitas tentativas de pagamento. Tente novamente em 15 minutos.',
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    helmetConfig,
    apiLimiter,
    paymentLimiter,
};

