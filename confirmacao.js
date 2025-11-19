// ===== CONFIRMACAO.JS =====
// Funcionalidades da página de confirmação

// ===== INICIALIZAÇÃO =====

document.addEventListener('DOMContentLoaded', function() {
    initializeConfirmationPage();
});

function initializeConfirmationPage() {
    // Carregar informações do pedido
    loadOrderInfo();
    
    // Limpar carrinho
    clearCart();
    
    console.log('Página de confirmação inicializada');
}

// ===== CARREGAR INFORMAÇÕES DO PEDIDO =====

function loadOrderInfo() {
    const orderId = localStorage.getItem('currentOrderId');
    
    if (!orderId) {
        showGenericOrderInfo();
        return;
    }
    
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        showGenericOrderInfo();
        return;
    }
    
    displayOrderInfo(order);
}

function displayOrderInfo(order) {
    const orderInfoContainer = document.getElementById('orderInfo');
    
    if (!orderInfoContainer) return;
    
    const orderDate = new Date(order.date).toLocaleDateString('pt-BR');
    const orderTime = new Date(order.date).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    orderInfoContainer.innerHTML = `
        <div class="order-details">
            <div class="detail-item">
                <span class="label">Número do Pedido:</span>
                <span class="value">#${order.id}</span>
            </div>
            <div class="detail-item">
                <span class="label">Data do Pedido:</span>
                <span class="value">${orderDate} às ${orderTime}</span>
            </div>
            <div class="detail-item">
                <span class="label">Valor Total:</span>
                <span class="value">R$ ${order.total.toFixed(2).replace('.', ',')}</span>
            </div>
            <div class="detail-item">
                <span class="label">Forma de Pagamento:</span>
                <span class="value">${getPaymentMethodName(order.paymentMethod)}</span>
            </div>
            <div class="detail-item">
                <span class="label">Status:</span>
                <span class="value status-${order.status}">${getStatusName(order.status)}</span>
            </div>
        </div>
        
        <div class="order-items-summary">
            <h4>Itens do Pedido:</h4>
            <div class="items-list">
                ${order.items.map(item => `
                    <div class="item-summary">
                        <img src="${item.imagem}" alt="${item.nome}" class="item-image">
                        <div class="item-info">
                            <h5>${item.nome}</h5>
                            <p>Tamanho: ${item.tamanho}</p>
                            <p>Quantidade: ${item.quantidade}</p>
                        </div>
                        <div class="item-price">
                            R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="shipping-info">
            <h4>Endereço de Entrega:</h4>
            <div class="address-details">
                <p>${order.address.rua}, ${order.address.numero}</p>
                <p>${order.address.bairro} - ${order.address.cidade}/${order.address.estado}</p>
                <p>CEP: ${order.address.cep}</p>
                ${order.address.complemento ? `<p>Complemento: ${order.address.complemento}</p>` : ''}
            </div>
        </div>
    `;
}

function showGenericOrderInfo() {
    const orderInfoContainer = document.getElementById('orderInfo');
    
    if (!orderInfoContainer) return;
    
    orderInfoContainer.innerHTML = `
        <div class="order-details">
            <div class="detail-item">
                <span class="label">Status:</span>
                <span class="value status-pending">Processando</span>
            </div>
            <div class="detail-item">
                <span class="label">Data:</span>
                <span class="value">${new Date().toLocaleDateString('pt-BR')}</span>
            </div>
        </div>
        
        <div class="generic-message">
            <p>Seu pedido foi recebido e está sendo processado. Você receberá um email de confirmação em breve.</p>
        </div>
    `;
}

// ===== FUNÇÕES AUXILIARES =====

function getPaymentMethodName(method) {
    const methods = {
        'credit-card': 'Cartão de Crédito',
        'debit-card': 'Cartão de Débito',
        'pix': 'PIX',
        'boleto': 'Boleto Bancário'
    };
    
    return methods[method] || method;
}

function getStatusName(status) {
    const statuses = {
        'pending': 'Processando',
        'confirmed': 'Confirmado',
        'shipped': 'Enviado',
        'delivered': 'Entregue',
        'cancelled': 'Cancelado'
    };
    
    return statuses[status] || status;
}

function clearCart() {
    // Limpar carrinho
    localStorage.removeItem('cartItems');
    
    // Atualizar contador do carrinho
    updateCartCount();
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = '0';
    }
}

// ===== FUNÇÕES DE BUSCA =====
// A função performSearch() está definida em script.js e funciona globalmente
// Não é necessário redefinir aqui, pois script.js já é carregado antes

