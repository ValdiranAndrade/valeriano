// Rotas de pagamento
const express = require('express');
const router = express.Router();
const { client, Payment } = require('../config/mercadopago');
const { Preference } = require('mercadopago');
const { paymentLimiter } = require('../middleware/security');

// Armazenamento temporário de pedidos (em produção, usar banco de dados)
const orders = [];

// Validação de dados do pedido
function validateOrderData(orderData) {
    const errors = [];
    
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        errors.push('Itens do pedido são obrigatórios');
    }
    
    if (!orderData.total || typeof orderData.total !== 'number' || orderData.total <= 0) {
        errors.push('Total do pedido inválido');
    }
    
    if (!orderData.customer || !orderData.customer.email) {
        errors.push('Email do cliente é obrigatório');
    }
    
    if (!orderData.customer || !orderData.customer.cpf) {
        errors.push('CPF do cliente é obrigatório');
    }
    
    if (!orderData.address) {
        errors.push('Endereço de entrega é obrigatório');
    }
    
    return errors;
}

// Criar preferência de pagamento (para checkout redirect)
router.post('/create-preference', paymentLimiter, async (req, res) => {
    try {
        const orderData = req.body;
        
        // Validar dados
        const validationErrors = validateOrderData(orderData);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                errors: validationErrors
            });
        }
        
        // Preparar itens para Mercado Pago
        const items = orderData.items.map(item => ({
            title: item.nome || item.name || 'Produto',
            quantity: item.quantidade || item.quantity || 1,
            unit_price: parseFloat(item.preco || item.price || 0),
            currency_id: 'BRL'
        }));
        
        // Determinar tipo de pagamento solicitado
        const paymentType = orderData.paymentType || 'all';
        
        // Configurar métodos de pagamento baseado no tipo solicitado
        let paymentMethodsConfig = {
            excluded_payment_methods: [],
            excluded_payment_types: [],
            installments: orderData.installments || 12
        };
        
        // Se for PIX, permitir apenas PIX (bank_transfer)
        if (paymentType === 'pix') {
            paymentMethodsConfig.excluded_payment_types = [
                { id: 'credit_card' },
                { id: 'debit_card' },
                { id: 'ticket' }
            ];
            // PIX é um tipo de bank_transfer, então não excluímos bank_transfer
        }
        // Se for Boleto, permitir apenas Boleto
        else if (paymentType === 'bolbradesco' || paymentType === 'pec') {
            paymentMethodsConfig.excluded_payment_types = [
                { id: 'credit_card' },
                { id: 'debit_card' },
                { id: 'bank_transfer' }
            ];
            paymentMethodsConfig.excluded_payment_methods = paymentType === 'pec' 
                ? [{ id: 'bolbradesco' }]
                : [{ id: 'pec' }];
        }
        
        // Criar preferência de pagamento
        const preference = {
            items: items,
            payer: {
                name: orderData.customer.fullName || orderData.customer.name,
                surname: '',
                email: orderData.customer.email,
                phone: {
                    area_code: '',
                    number: orderData.customer.phone.replace(/\D/g, '')
                },
                identification: {
                    type: 'CPF',
                    number: orderData.customer.cpf.replace(/\D/g, '')
                },
                address: {
                    street_name: orderData.address.rua || orderData.address.street,
                    street_number: parseInt(orderData.address.numero || orderData.address.number),
                    zip_code: orderData.address.cep.replace(/\D/g, '')
                }
            },
            back_urls: {
                success: `${process.env.FRONTEND_URL || 'http://localhost:5500'}/confirmacao.html`,
                failure: `${process.env.FRONTEND_URL || 'http://localhost:5500'}/pagamento.html?error=1`,
                pending: `${process.env.FRONTEND_URL || 'http://localhost:5500'}/confirmacao.html?status=pending`
            },
            // auto_return apenas se todas as URLs estiverem definidas
            // Removido auto_return para evitar erro com PIX/Boleto
            payment_methods: paymentMethodsConfig,
            statement_descriptor: 'LOJA DE ROUPAS',
            external_reference: `order_${Date.now()}`,
            notification_url: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/payment/webhook`
        };
        
        // Para PIX, adicionar configurações específicas
        if (paymentType === 'pix') {
            preference.payment_methods = {
                ...paymentMethodsConfig,
                default_payment_method_id: null
            };
        }
        
        const preferenceClient = new Preference(client);
        const response = await preferenceClient.create({ body: preference });
        
        console.log('Resposta completa do Mercado Pago:', JSON.stringify(response, null, 2));
        
        // Salvar pedido temporariamente
        const orderId = preference.external_reference;
        orders.push({
            id: orderId,
            preferenceId: response.id,
            status: 'pending',
            data: orderData,
            createdAt: new Date()
        });
        
        // O SDK v2 retorna init_point e sandbox_init_point
        const initPoint = response.init_point || response.initPoint;
        const sandboxInitPoint = response.sandbox_init_point || response.sandboxInitPoint;
        
        console.log('initPoint:', initPoint);
        console.log('sandboxInitPoint:', sandboxInitPoint);
        
        // Usar initPoint se estiver em produção, senão sandboxInitPoint
        const checkoutUrl = process.env.MERCADOPAGO_MODE === 'production' 
            ? (initPoint || sandboxInitPoint)
            : (sandboxInitPoint || initPoint);
        
        res.json({
            success: true,
            preferenceId: response.id,
            initPoint: initPoint,
            sandboxInitPoint: sandboxInitPoint,
            checkoutUrl: checkoutUrl, // URL pronta para uso
            orderId: orderId
        });
        
    } catch (error) {
        console.error('Erro ao criar preferência:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao processar pagamento',
            message: error.message
        });
    }
});

// Processar pagamento com cartão (API direta)
router.post('/process', paymentLimiter, async (req, res) => {
    try {
        // Verificar se está em produção e validar credenciais
        const mode = process.env.MERCADOPAGO_MODE;
        if (mode === 'production') {
            const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
            if (!accessToken || accessToken.startsWith('TEST-')) {
                return res.status(500).json({
                    success: false,
                    error: 'Configuração inválida para produção',
                    message: 'Credenciais de teste não podem ser usadas em produção'
                });
            }
        }
        
        const { orderData, paymentData } = req.body;
        
        // Validar dados
        const validationErrors = validateOrderData(orderData);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                errors: validationErrors
            });
        }
        
        // Validar dados de pagamento
        if (!paymentData || !paymentData.token) {
            return res.status(400).json({
                success: false,
                error: 'Token do cartão é obrigatório'
            });
        }
        
        // Criar objeto de pagamento
        const payment = {
            transaction_amount: parseFloat(orderData.total),
            token: paymentData.token,
            description: `Pedido #${Date.now()}`,
            installments: parseInt(paymentData.installments || 1),
            payment_method_id: paymentData.payment_method_id || 'visa',
            issuer_id: parseInt(paymentData.issuer_id) || null,
            payer: {
                email: orderData.customer.email,
                identification: {
                    type: 'CPF',
                    number: orderData.customer.cpf.replace(/\D/g, '')
                }
            },
            external_reference: `order_${Date.now()}`
        };
        
        // Processar pagamento
        const paymentClient = new Payment(client);
        const response = await paymentClient.create({ body: payment });
        
        const orderId = payment.external_reference;
        
        // Log do pagamento (sem dados sensíveis)
        if (mode === 'production') {
            console.log(`💰 PAGAMENTO REAL processado - ID: ${response.id}, Status: ${response.status}, Valor: R$ ${orderData.total}`);
        } else {
            console.log(`🧪 Pagamento de teste processado - ID: ${response.id}, Status: ${response.status}`);
        }
        
        if (response.status === 'approved' || response.status === 'pending' || response.status === 'in_process') {
            const paymentStatus = response.status;
            
            // Salvar pedido
            orders.push({
                id: orderId,
                paymentId: response.id,
                status: paymentStatus,
                data: orderData,
                paymentResponse: {
                    id: response.id,
                    status: paymentStatus,
                    status_detail: response.status_detail
                },
                createdAt: new Date()
            });
            
            res.json({
                success: true,
                paymentId: response.id,
                status: paymentStatus,
                statusDetail: response.status_detail,
                orderId: orderId,
                message: getStatusMessage(paymentStatus)
            });
        } else {
            // Log de pagamento recusado
            if (mode === 'production') {
                console.warn(`⚠️  PAGAMENTO REAL RECUSADO - ID: ${response.id}, Motivo: ${response.message || 'Desconhecido'}`);
            }
            
            res.status(400).json({
                success: false,
                error: 'Pagamento recusado',
                message: response.message || 'Erro ao processar pagamento',
                status: response.status
            });
        }
        
    } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao processar pagamento',
            message: error.message
        });
    }
});

// Webhook para notificações do Mercado Pago
router.post('/webhook', express.json(), async (req, res) => {
    try {
        const { type, data } = req.body;
        
        if (type === 'payment') {
            const paymentId = data.id;
            
            // Buscar informações do pagamento
            const paymentClient = new Payment(client);
            const payment = await paymentClient.get({ id: paymentId });
            
            // Atualizar status do pedido (em produção, atualizar no banco de dados)
            const orderIndex = orders.findIndex(o => o.paymentId === paymentId);
            if (orderIndex !== -1) {
                orders[orderIndex].status = payment.status;
                orders[orderIndex].paymentResponse = {
                    id: payment.id,
                    status: payment.status,
                    status_detail: payment.status_detail
                };
            }
            
            console.log(`Webhook recebido - Payment ID: ${paymentId}, Status: ${payment.status}`);
        }
        
        res.status(200).send('OK');
    } catch (error) {
        console.error('Erro ao processar webhook:', error);
        res.status(500).send('Error');
    }
});

// Obter Public Key do Mercado Pago (para uso no frontend)
router.get('/mercadopago/public-key', (req, res) => {
    const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY;
    
    if (!publicKey) {
        return res.status(500).json({
            success: false,
            error: 'Public Key não configurada no servidor'
        });
    }
    
    res.json({
        success: true,
        publicKey: publicKey
    });
});

// Consultar status do pedido
router.get('/status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = orders.find(o => o.id === orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Pedido não encontrado'
            });
        }
        
        res.json({
            success: true,
            order: {
                id: order.id,
                status: order.status,
                paymentId: order.paymentId,
                createdAt: order.createdAt
            }
        });
    } catch (error) {
        console.error('Erro ao consultar status:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao consultar status do pedido'
        });
    }
});

// Função auxiliar para mensagens de status
function getStatusMessage(status) {
    const messages = {
        'approved': 'Pagamento aprovado!',
        'pending': 'Pagamento pendente de aprovação',
        'rejected': 'Pagamento recusado',
        'refunded': 'Pagamento estornado',
        'cancelled': 'Pagamento cancelado',
        'charged_back': 'Pagamento contestado'
    };
    
    return messages[status] || 'Status desconhecido';
}

module.exports = router;

