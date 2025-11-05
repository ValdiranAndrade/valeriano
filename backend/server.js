// Servidor principal
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const { helmetConfig, apiLimiter } = require('./middleware/security');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de segurança
app.use(helmetConfig);
app.use(apiLimiter);

// Configurar CORS
// Em desenvolvimento, aceitar múltiplas origens (incluindo file://)
const corsOptions = {
    origin: function (origin, callback) {
        // Lista de origens permitidas
        const allowedOrigins = [
            process.env.FRONTEND_URL || 'http://localhost:5500',
            'http://localhost:5500',
            'http://127.0.0.1:5500',
            'http://localhost:8080',
            'http://127.0.0.1:8080',
            null // Permite file:// (abrir HTML direto)
        ];
        
        // Em desenvolvimento, aceitar qualquer origem
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        
        // Em produção, verificar origem
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Não permitido por CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging de requisições
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Rotas de API
app.use('/api/payment', paymentRoutes);

// Rota adicional para Public Key (opcional, mas recomendado)
app.get('/api/mercadopago/public-key', (req, res) => {
    const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY;
    
    if (!publicKey) {
        return res.status(500).json({
            success: false,
            error: 'Public Key não configurada'
        });
    }
    
    res.json({
        success: true,
        publicKey: publicKey
    });
});

// Rota de health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.MERCADOPAGO_MODE || 'not configured'
    });
});

// Servir arquivos estáticos (opcional - para produção)
app.use(express.static(path.join(__dirname, '../')));

// Rota de teste
app.get('/api/test', (req, res) => {
    res.json({
        message: 'Backend funcionando!',
        timestamp: new Date().toISOString()
    });
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro:', err);
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Erro ao processar requisição'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 Servidor iniciado!');
    console.log(`📡 Porta: ${PORT}`);
    console.log(`🌐 Ambiente: ${process.env.MERCADOPAGO_MODE || 'not configured'}`);
    console.log(`🔗 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5500'}`);
    console.log('='.repeat(50));
    console.log('\n⚠️  Certifique-se de configurar as variáveis de ambiente no arquivo .env');
    console.log('📖 Veja README.md para instruções\n');
});

module.exports = app;

