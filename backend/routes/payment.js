// Rotas de pagamento
const express = require('express');
const router = express.Router();
const mercadopago = require('../config/mercadopago');
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
            auto_return: 'approved',
            payment_methods: {
                excluded_payment_methods: [],
                excluded_payment_types: [],
                installments: orderData.installments || 12
            },
            statement_descriptor: 'LOJA DE ROUPAS',
            external_reference: `order_${Date.now()}`,
            notification_url: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/payment/webhook`
        };
        
        const response = await mercadopago.preferences.create(preference);
        
        // Salvar pedido temporariamente
        const orderId = response.body.external_reference;
        orders.push({
            id: orderId,
            preferenceId: response.body.id,
            status: 'pending',
            data: orderData,
            createdAt: new Date()
        });
        
        res.json({
            success: true,
            preferenceId: response.body.id,
            initPoint: response.body.init_point,
            sandboxInitPoint: response.body.sandbox_init_point,
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
        const response = await mercadopago.payment.save(payment);
        
        const orderId = payment.external_reference;
        
        if (response.status === 200 || response.status === 201) {
            const paymentStatus = response.body.status;
            
            // Salvar pedido
            orders.push({
                id: orderId,
                paymentId: response.body.id,
                status: paymentStatus,
                data: orderData,
                paymentResponse: {
                    id: response.body.id,
                    status: paymentStatus,
                    status_detail: response.body.status_detail
                },
                createdAt: new Date()
            });
            
            res.json({
                success: true,
                paymentId: response.body.id,
                status: paymentStatus,
                statusDetail: response.body.status_detail,
                orderId: orderId,
                message: getStatusMessage(paymentStatus)
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Pagamento recusado',
                message: response.body.message || 'Erro ao processar pagamento',
                status: response.body.status
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
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const { type, data } = req.body;
        
        if (type === 'payment') {
            const paymentId = data.id;
            
            // Buscar informações do pagamento
            const payment = await mercadopago.payment.findById(paymentId);
            
            // Atualizar status do pedido (em produção, atualizar no banco de dados)
            const orderIndex = orders.findIndex(o => o.paymentId === paymentId);
            if (orderIndex !== -1) {
                orders[orderIndex].status = payment.body.status;
                orders[orderIndex].paymentResponse = {
                    id: payment.body.id,
                    status: payment.body.status,
                    status_detail: payment.body.status_detail
                };
            }
            
            console.log(`Webhook recebido - Payment ID: ${paymentId}, Status: ${payment.body.status}`);
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

