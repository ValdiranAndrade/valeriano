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
const corsOptions = {
    origin: function (origin, callback) {
        // Lista de origens permitidas
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            process.env.PRODUCTION_URL,
            'http://localhost:5500',
            'http://127.0.0.1:5500',
            'http://localhost:8080',
            'http://127.0.0.1:8080',
            null // Permite file:// (abrir HTML direto)
        ].filter(Boolean); // Remove valores undefined/null
        
        // Em desenvolvimento ou se NODE_ENV não for production, aceitar qualquer origem
        if (process.env.NODE_ENV !== 'production' || process.env.MERCADOPAGO_MODE !== 'production') {
            return callback(null, true);
        }
        
        // Em produção, verificar origem estritamente
        if (!origin) {
            // Permitir requisições sem origin (ex: Postman, mobile apps)
            return callback(null, true);
        }
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`⚠️  Requisição bloqueada por CORS de origem: ${origin}`);
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

// Validação de configuração para produção
function validateProductionConfig() {
    const mode = process.env.MERCADOPAGO_MODE;
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY;
    
    if (!accessToken || !publicKey) {
        console.error('❌ ERRO: Credenciais do Mercado Pago não configuradas!');
        console.error('   Configure MERCADOPAGO_ACCESS_TOKEN e MERCADOPAGO_PUBLIC_KEY no arquivo .env');
        process.exit(1);
    }
    
    if (mode === 'production') {
        // Validar que são credenciais de produção (não de teste)
        if (accessToken.startsWith('TEST-') || publicKey.startsWith('TEST-')) {
            console.error('❌ ERRO: Modo PRODUÇÃO configurado mas usando credenciais de TESTE!');
            console.error('   Use credenciais que começam com APP_USR- para produção');
            process.exit(1);
        }
        
        if (!accessToken.startsWith('APP_USR-') || !publicKey.startsWith('APP_USR-')) {
            console.warn('⚠️  AVISO: Credenciais podem não ser de produção');
            console.warn('   Em produção, use credenciais que começam com APP_USR-');
        }
        
        console.log('✅ Modo PRODUÇÃO - Processando pagamentos REAIS!');
    } else if (mode === 'sandbox') {
        console.log('🧪 Modo SANDBOX - Processando pagamentos de TESTE');
    } else {
        console.warn('⚠️  Modo não especificado, usando configuração padrão');
    }
}

// Validar configuração antes de iniciar
validateProductionConfig();

// Iniciar servidor
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 Servidor iniciado!');
    console.log(`📡 Porta: ${PORT}`);
    console.log(`🌐 Ambiente: ${process.env.MERCADOPAGO_MODE || 'not configured'}`);
    console.log(`🔗 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5500'}`);
    console.log('='.repeat(50));
    
    if (process.env.MERCADOPAGO_MODE === 'production') {
        console.log('\n⚠️  ATENÇÃO: Servidor em modo PRODUÇÃO');
        console.log('   Todos os pagamentos serão REAIS e cobrados!');
        console.log('   Certifique-se de que está usando credenciais de produção\n');
    } else {
        console.log('\n⚠️  Certifique-se de configurar as variáveis de ambiente no arquivo .env');
        console.log('📖 Veja README.md para instruções\n');
    }
});

module.exports = app;

