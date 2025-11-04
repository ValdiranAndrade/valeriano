// ===== PAGAMENTO.JS =====
// Funcionalidades da página de pagamento

// ===== INICIALIZAÇÃO =====

document.addEventListener('DOMContentLoaded', function() {
    initializePaymentPage();
});

function initializePaymentPage() {
    // Carregar dados do carrinho
    loadCartData();
    
    // Configurar event listeners
    setupPaymentForm();
    
    // Configurar validações
    setupValidations();
    
    // Carregar dados do usuário se logado
    loadUserData();
    
    console.log('Página de pagamento inicializada');
}

// ===== CARREGAR DADOS DO CARRINHO =====

function loadCartData() {
    try {
        const cartData = localStorage.getItem('cartItems');
        const cartItems = cartData ? JSON.parse(cartData) : [];
        
        console.log('Itens do carrinho carregados:', cartItems);
        
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            showNotification('Seu carrinho está vazio', 'warning');
            setTimeout(() => {
                window.location.href = 'carrinho.html';
            }, 2000);
            return;
        }
        
        // Log dos itens normalizados para debug
        const normalizedItems = cartItems.map(item => normalizeCartItem(item));
        console.log('Itens normalizados:', normalizedItems);
        console.log('Preços extraídos:', normalizedItems.map(item => ({ nome: item.nome, preco: item.preco, quantidade: item.quantidade })));
        
        displayOrderItems(cartItems);
        calculateTotals(cartItems);
    } catch (error) {
        console.error('Erro ao carregar dados do carrinho:', error);
        showNotification('Erro ao carregar itens do carrinho', 'error');
    }
}

function displayOrderItems(cartItems) {
    const orderItemsContainer = document.getElementById('orderItems');
    
    if (!orderItemsContainer) return;
    
    orderItemsContainer.innerHTML = '';
    
    cartItems.forEach(item => {
        // Normalizar item usando a função auxiliar
        const normalizedItem = normalizeCartItem(item);
        
        // Calcular total do item
        const totalItem = normalizedItem.preco * normalizedItem.quantidade;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.innerHTML = `
            <div class="item-image">
                <img src="${normalizedItem.imagem}" alt="${normalizedItem.nome}" onerror="this.src='imagens/placeholder.png'">
            </div>
            <div class="item-details">
                <h4>${normalizedItem.nome}</h4>
                <p>Tamanho: ${normalizedItem.tamanho}</p>
                <p>Quantidade: ${normalizedItem.quantidade}</p>
            </div>
            <div class="item-price">
                <span>R$ ${totalItem.toFixed(2).replace('.', ',')}</span>
            </div>
        `;
        
        orderItemsContainer.appendChild(itemElement);
    });
}

// Função para extrair valor numérico de preço formatado
function extractPrice(price) {
    if (!price && price !== 0) return 0;
    
    // Se já é um número, retornar
    if (typeof price === 'number') {
        return isNaN(price) || !isFinite(price) ? 0 : price;
    }
    
    // Se é string, extrair número
    if (typeof price === 'string') {
        // Remover símbolos de moeda e espaços
        let cleaned = price
            .trim()
            .replace(/R\$\s*/gi, '')      // Remove "R$ "
            .replace(/reais?/gi, '')     // Remove "reais"
            .replace(/\s+/g, '');         // Remove espaços
        
        // Verificar se usa vírgula como separador decimal (formato brasileiro)
        const hasComma = cleaned.includes(',');
        const hasDot = cleaned.includes('.');
        
        if (hasComma && hasDot) {
            // Formato: "1.299,90" - ponto é milhar, vírgula é decimal
            cleaned = cleaned.replace(/\./g, '').replace(',', '.');
        } else if (hasComma && !hasDot) {
            // Formato: "299,90" - vírgula é decimal
            cleaned = cleaned.replace(',', '.');
        } else if (!hasComma && hasDot) {
            // Formato: "299.90" ou "1.299.90" - ponto pode ser decimal ou milhar
            // Se tiver mais de um ponto, provavelmente é separador de milhar
            const dotCount = (cleaned.match(/\./g) || []).length;
            if (dotCount > 1) {
                // Múltiplos pontos = separador de milhar, remover todos
                cleaned = cleaned.replace(/\./g, '');
            }
            // Se tiver apenas um ponto, já está no formato correto
        }
        
        // Remover qualquer caractere não numérico (exceto ponto)
        cleaned = cleaned.replace(/[^\d.]/g, '');
        
        const parsed = parseFloat(cleaned);
        
        // Log para debug
        console.log(`Extraindo preço de "${price}" -> "${cleaned}" -> ${parsed}`);
        
        return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
    }
    
    return 0;
}

// Função auxiliar para normalizar itens do carrinho
function normalizeCartItem(item) {
    if (!item || typeof item !== 'object') {
        console.warn('Item inválido no carrinho:', item);
        return {
            id: Date.now().toString(),
            nome: 'Produto inválido',
            imagem: 'imagens/placeholder.png',
            tamanho: 'N/A',
            quantidade: 1,
            preco: 0
        };
    }
    
    // Normalizar preço - tentar extrair de diferentes formatos
    let preco = 0;
    
    // Tentar diferentes propriedades de preço
    const priceSource = item.preco || item.price || item.valor || item.precoUnidade || item.precoUnitario || 0;
    preco = extractPrice(priceSource);
    
    // Validar preço
    if (isNaN(preco) || !isFinite(preco) || preco < 0) {
        preco = 0;
    }
    
    // Normalizar quantidade
    let quantidade = parseInt(item.quantidade || item.quantity || item.qty || item.amount || 1);
    if (isNaN(quantidade) || !isFinite(quantidade) || quantidade < 1) {
        quantidade = 1;
    }
    
    // Normalizar item para ter propriedades consistentes
    return {
        id: item.id || item.productId || Date.now().toString(),
        nome: item.nome || item.name || item.title || item.productName || 'Produto sem nome',
        imagem: item.imagem || item.image || item.img || item.photo || item.productImage || 'imagens/placeholder.png',
        tamanho: item.tamanho || item.size || item.tamanhoProduto || 'N/A',
        quantidade: quantidade,
        preco: preco
    };
}

function calculateTotals(cartItems) {
    // Validar se cartItems é um array válido
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        updateTotalsDisplay(0, 0, 0, 0);
        return;
    }
    
    // Calcular subtotal normalizando propriedades
    const subtotal = cartItems.reduce((total, item) => {
        const normalizedItem = normalizeCartItem(item);
        const itemPrice = isNaN(normalizedItem.preco) ? 0 : normalizedItem.preco;
        const itemQty = isNaN(normalizedItem.quantidade) ? 0 : normalizedItem.quantidade;
        const itemTotal = itemPrice * itemQty;
        
        console.log(`Item: ${normalizedItem.nome} - Preço: ${itemPrice}, Qty: ${itemQty}, Total: ${itemTotal}`);
        
        return total + (isNaN(itemTotal) ? 0 : itemTotal);
    }, 0);
    
    console.log('Subtotal calculado:', subtotal);
    
    // Garantir que subtotal é um número válido
    const validSubtotal = isNaN(subtotal) || !isFinite(subtotal) ? 0 : subtotal;
    
    // Buscar CEP do formulário se disponível
    const cepInput = document.getElementById('cep');
    const cep = cepInput ? cepInput.value.replace(/\D/g, '') : null;
    
    // Usar frete calculado pelo CEP ou calcular padrão
    const shipping = calculatedShipping > 0 && cepShippingData ? calculatedShipping : calculateShipping(validSubtotal, cep);
    const discount = calculateDiscount(validSubtotal);
    const total = validSubtotal + shipping - discount;
    
    // Garantir que total é um número válido
    const validTotal = isNaN(total) || !isFinite(total) ? 0 : total;
    
    // Atualizar elementos na tela
    updateTotalsDisplay(validSubtotal, shipping, discount, validTotal);
    
    // Salvar total no localStorage
    localStorage.setItem('orderTotal', validTotal.toString());
}

function updateTotalsDisplay(subtotal, shipping, discount, total) {
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const discountElement = document.getElementById('discount');
    const totalElement = document.getElementById('total');
    
    if (subtotalElement) {
        subtotalElement.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    }
    
    if (shippingElement) {
        shippingElement.textContent = `R$ ${shipping.toFixed(2).replace('.', ',')}`;
    }
    
    if (discountElement) {
        discountElement.textContent = `- R$ ${discount.toFixed(2).replace('.', ',')}`;
    }
    
    if (totalElement) {
        totalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }
}

// Variável global para armazenar o frete calculado
let calculatedShipping = 0;
let cepShippingData = null;

function calculateShipping(subtotal, cep = null) {
    // Se não houver CEP, usar cálculo simples baseado no valor
    if (!cep) {
        const validSubtotal = isNaN(subtotal) || !isFinite(subtotal) || subtotal < 0 ? 0 : subtotal;
        
        // Frete grátis para compras acima de R$ 200
        if (validSubtotal >= 200) {
            calculatedShipping = 0;
            return 0;
        }
        
        // Frete fixo de R$ 15 para compras abaixo de R$ 200
        calculatedShipping = 15;
        return 15;
    }
    
    // Se houver frete calculado pelo CEP, usar esse valor
    if (calculatedShipping > 0 && cepShippingData) {
        return calculatedShipping;
    }
    
    // Caso contrário, calcular baseado no valor (fallback)
    const validSubtotal = isNaN(subtotal) || !isFinite(subtotal) || subtotal < 0 ? 0 : subtotal;
    if (validSubtotal >= 200) {
        calculatedShipping = 0;
        return 0;
    }
    
    calculatedShipping = 15;
    return 15;
}

// Função para buscar dados do CEP usando ViaCEP
async function buscarCEP(cep) {
    // Remover formatação do CEP
    const cleanCEP = cep.replace(/\D/g, '');
    
    if (cleanCEP.length !== 8) {
        return null;
    }
    
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
        const data = await response.json();
        
        if (data.erro) {
            console.error('CEP não encontrado:', cep);
            return null;
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        return null;
    }
}

// Função para calcular frete baseado no CEP (simulado - pode ser substituída por API real)
async function calcularFretePorCEP(cep, subtotal, peso = 1) {
    try {
        // Buscar dados do CEP
        const cepData = await buscarCEP(cep);
        
        if (!cepData) {
            // Se não encontrar CEP, usar cálculo padrão
            return calculateShipping(subtotal);
        }
        
        // Calcular frete baseado em regras (simulado)
        // Em produção, você usaria a API dos Correios aqui
        
        const validSubtotal = isNaN(subtotal) || !isFinite(subtotal) || subtotal < 0 ? 0 : subtotal;
        
        // Frete grátis para compras acima de R$ 200
        if (validSubtotal >= 200) {
            calculatedShipping = 0;
            cepShippingData = {
                cep: cep,
                valor: 0,
                prazo: 0,
                tipo: 'Grátis',
                endereco: cepData
            };
            return 0;
        }
        
        // Calcular frete baseado na região (simulado)
        let frete = 15; // Valor base
        
        // Regiões mais próximas têm frete menor
        const estadosSudeste = ['SP', 'RJ', 'MG', 'ES'];
        const estadosSul = ['PR', 'SC', 'RS'];
        const estadosCentroOeste = ['DF', 'GO', 'MT', 'MS'];
        const estadosNordeste = ['BA', 'PE', 'CE', 'RN', 'PB', 'AL', 'SE', 'PI', 'MA'];
        const estadosNorte = ['AM', 'PA', 'AC', 'RO', 'RR', 'AP', 'TO'];
        
        if (estadosSudeste.includes(cepData.uf)) {
            // Sudeste: R$ 15 (valor base)
            frete = 15;
        } else if (estadosSul.includes(cepData.uf)) {
            // Sul: R$ 20
            frete = 20;
        } else if (estadosCentroOeste.includes(cepData.uf)) {
            // Centro-Oeste: R$ 25
            frete = 25;
        } else if (estadosNordeste.includes(cepData.uf)) {
            // Nordeste: R$ 30
            frete = 30;
        } else if (estadosNorte.includes(cepData.uf)) {
            // Norte: R$ 35
            frete = 35;
        }
        
        // Adicionar custo baseado no peso (simulado)
        const pesoAdicional = Math.max(0, peso - 1); // Peso acima de 1kg
        frete += pesoAdicional * 5; // R$ 5 por kg adicional
        
        // Calcular prazo estimado (dias úteis)
        let prazo = 5; // Base
        
        if (estadosSudeste.includes(cepData.uf)) {
            prazo = 3;
        } else if (estadosSul.includes(cepData.uf)) {
            prazo = 5;
        } else if (estadosCentroOeste.includes(cepData.uf)) {
            prazo = 7;
        } else if (estadosNordeste.includes(cepData.uf)) {
            prazo = 8;
        } else if (estadosNorte.includes(cepData.uf)) {
            prazo = 10;
        }
        
        calculatedShipping = frete;
        cepShippingData = {
            cep: cep,
            valor: frete,
            prazo: prazo,
            tipo: 'PAC',
            endereco: cepData
        };
        
        return frete;
    } catch (error) {
        console.error('Erro ao calcular frete:', error);
        // Fallback para cálculo padrão
        return calculateShipping(subtotal);
    }
}

function calculateDiscount(subtotal) {
    // Validar subtotal
    const validSubtotal = isNaN(subtotal) || !isFinite(subtotal) || subtotal < 0 ? 0 : subtotal;
    
    // Desconto de 10% para compras acima de R$ 300
    if (validSubtotal >= 300) {
        const discount = validSubtotal * 0.1;
        return isNaN(discount) || !isFinite(discount) ? 0 : discount;
    }
    
    return 0;
}

// ===== CONFIGURAR FORMULÁRIO =====

function setupPaymentForm() {
    const paymentForm = document.getElementById('payment-form');
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    
    // Configurar mudança de método de pagamento
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            togglePaymentDetails(this.value);
        });
    });
    
    // Configurar envio do formulário
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmit);
    }
    
    // Configurar máscaras de input
    setupInputMasks();
}

function togglePaymentDetails(method) {
    // Esconder todos os detalhes
    document.getElementById('card-details').style.display = 'none';
    document.getElementById('pix-details').style.display = 'none';
    document.getElementById('boleto-details').style.display = 'none';
    
    // Mostrar detalhes do método selecionado
    switch(method) {
        case 'credit-card':
        case 'debit-card':
            document.getElementById('card-details').style.display = 'block';
            break;
        case 'pix':
            document.getElementById('pix-details').style.display = 'block';
            break;
        case 'boleto':
            document.getElementById('boleto-details').style.display = 'block';
            break;
    }
}

function setupInputMasks() {
    // Máscara para CEP e busca automática
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/^(\d{5})(\d)/, '$1-$2');
            e.target.value = value;
        });
        
        // Buscar CEP quando o usuário sair do campo (blur)
        cepInput.addEventListener('blur', async function() {
            const cep = this.value.replace(/\D/g, '');
            
            if (cep.length === 8) {
                // Mostrar loading
                const shippingElement = document.getElementById('shipping');
                if (shippingElement) {
                    shippingElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculando...';
                }
                
                try {
                    // Buscar dados do CEP
                    const cepData = await buscarCEP(cep);
                    
                    if (cepData && !cepData.erro) {
                        // Auto-preencher campos do endereço
                        const estadoInput = document.getElementById('estado');
                        const cidadeInput = document.getElementById('cidade');
                        const bairroInput = document.getElementById('bairro');
                        const ruaInput = document.getElementById('rua');
                        
                        if (estadoInput) estadoInput.value = cepData.uf || '';
                        if (cidadeInput) cidadeInput.value = cepData.localidade || '';
                        if (bairroInput) bairroInput.value = cepData.bairro || '';
                        if (ruaInput) ruaInput.value = cepData.logradouro || '';
                        
                        // Calcular frete automaticamente
                        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
                        const subtotal = cartItems.reduce((total, item) => {
                            const normalizedItem = normalizeCartItem(item);
                            return total + (normalizedItem.preco * normalizedItem.quantidade);
                        }, 0);
                        
                        // Calcular peso total (simulado: 0.5kg por item)
                        const pesoTotal = cartItems.length * 0.5;
                        
                        const frete = await calcularFretePorCEP(cep, subtotal, pesoTotal);
                        
                        // Atualizar totais
                        calculateTotals(cartItems);
                        
                        // Mostrar prazo de entrega
                        if (cepShippingData && cepShippingData.prazo > 0) {
                            const shippingInfo = document.getElementById('shipping-info');
                            const shippingInfoText = document.getElementById('shipping-info-text');
                            if (shippingInfo && shippingInfoText) {
                                shippingInfoText.textContent = `Prazo de entrega: ${cepShippingData.prazo} dias úteis`;
                                shippingInfo.style.display = 'block';
                            }
                        }
                    } else {
                        showNotification('CEP não encontrado', 'warning');
                        if (shippingElement) {
                            shippingElement.textContent = 'R$ 0,00';
                        }
                    }
                } catch (error) {
                    console.error('Erro ao buscar CEP:', error);
                    showNotification('Erro ao buscar CEP. Usando cálculo padrão.', 'warning');
                }
            }
        });
    }
    
    // Máscara para telefone
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            e.target.value = value;
        });
    }
    
    // Máscara para CPF
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            e.target.value = value;
        });
    }
    
    // Máscara para número do cartão
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            e.target.value = value;
        });
    }
    
    // Máscara para data de validade
    const expiryInput = document.getElementById('expiry-date');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/^(\d{2})(\d{2})/, '$1/$2');
            e.target.value = value;
        });
    }
}

// ===== VALIDAÇÕES =====

function setupValidations() {
    // Validação de CEP
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('blur', function() {
            validateCEP(this.value);
        });
    }
    
    // Validação de email
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            validateEmail(this.value);
        });
    }
    
    // Validação de CPF
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('blur', function() {
            validateCPF(this.value);
        });
    }
}

function validateCEP(cep) {
    const cepRegex = /^\d{5}-\d{3}$/;
    const isValid = cepRegex.test(cep);
    
    if (!isValid && cep.length > 0) {
        showFieldError('cep', 'CEP inválido');
    } else {
        clearFieldError('cep');
    }
    
    return isValid;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    if (!isValid && email.length > 0) {
        showFieldError('email', 'Email inválido');
    } else {
        clearFieldError('email');
    }
    
    return isValid;
}

function validateCPF(cpf) {
    // Remove formatação
    cpf = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) {
        showFieldError('cpf', 'CPF deve ter 11 dígitos');
        return false;
    }
    
    // Verifica se não são todos iguais
    if (/^(\d)\1{10}$/.test(cpf)) {
        showFieldError('cpf', 'CPF inválido');
        return false;
    }
    
    // Validação do algoritmo do CPF
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    let digit1 = remainder < 2 ? 0 : remainder;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    let digit2 = remainder < 2 ? 0 : remainder;
    
    const isValid = digit1 == cpf.charAt(9) && digit2 == cpf.charAt(10);
    
    if (!isValid) {
        showFieldError('cpf', 'CPF inválido');
    } else {
        clearFieldError('cpf');
    }
    
    return isValid;
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('error');
        
        // Remover erro anterior
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Adicionar nova mensagem de erro
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        field.parentNode.appendChild(errorElement);
    }
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.remove('error');
        
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }
}

// ===== PROCESSAR PAGAMENTO =====

function handlePaymentSubmit(e) {
    e.preventDefault();
    
    // Validar formulário
    if (!validatePaymentForm()) {
        showNotification('Por favor, corrija os erros no formulário', 'error');
        return;
    }
    
    // Mostrar loading
    const submitBtn = document.querySelector('.btn-finalizar');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
    submitBtn.disabled = true;
    
    // Simular processamento
    setTimeout(() => {
        processPayment();
        
        // Restaurar botão
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Validação de cartão de crédito usando algoritmo de Luhn
function validateCreditCard(cardNumber) {
    // Remover espaços e formatação
    const cleanNumber = cardNumber.replace(/\s/g, '').replace(/\D/g, '');
    
    // Verificar se tem 13-19 dígitos
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
        return false;
    }
    
    // Algoritmo de Luhn
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanNumber.charAt(i));
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
}

// Identificar bandeira do cartão
function getCardBrand(cardNumber) {
    const cleanNumber = cardNumber.replace(/\s/g, '').replace(/\D/g, '');
    
    // Visa
    if (/^4/.test(cleanNumber)) return 'visa';
    // Mastercard
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    // Amex
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    // Elo
    if (/^(4011|4312|4389|4514|4576|50|63|67)/.test(cleanNumber)) return 'elo';
    // Hipercard
    if (/^(38|60)/.test(cleanNumber)) return 'hipercard';
    
    return 'unknown';
}

function validatePaymentForm() {
    const form = document.getElementById('payment-form');
    const formData = new FormData(form);
    
    let isValid = true;
    
    // Validar campos obrigatórios
    const requiredFields = ['cep', 'estado', 'cidade', 'bairro', 'rua', 'numero', 'full-name', 'email', 'phone', 'cpf', 'terms'];
    
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (!field || !field.value.trim()) {
            showFieldError(fieldName, 'Este campo é obrigatório');
            isValid = false;
        }
    });
    
    // Validar método de pagamento
    const paymentMethod = formData.get('payment-method');
    if (!paymentMethod) {
        showNotification('Selecione uma forma de pagamento', 'error');
        isValid = false;
    }
    
    // Validar dados do cartão se necessário
    if (paymentMethod === 'credit-card' || paymentMethod === 'debit-card') {
        const cardNumber = formData.get('card-number');
        const cardName = formData.get('card-name');
        const expiryDate = formData.get('expiry-date');
        const cvv = formData.get('cvv');
        
        // Validar número do cartão
        if (!cardNumber || !cardNumber.trim()) {
            showFieldError('card-number', 'Número do cartão é obrigatório');
            isValid = false;
        } else if (!validateCreditCard(cardNumber)) {
            showFieldError('card-number', 'Número do cartão inválido');
            isValid = false;
        } else {
            // Mostrar bandeira do cartão
            const cardBrand = getCardBrand(cardNumber);
            console.log('Bandeira do cartão:', cardBrand);
        }
        
        // Validar nome
        if (!cardName || !cardName.trim()) {
            showFieldError('card-name', 'Nome no cartão é obrigatório');
            isValid = false;
        } else if (cardName.trim().length < 3) {
            showFieldError('card-name', 'Nome deve ter pelo menos 3 caracteres');
            isValid = false;
        }
        
        // Validar data de validade
        if (!expiryDate || !expiryDate.trim()) {
            showFieldError('expiry-date', 'Data de validade é obrigatória');
            isValid = false;
        } else {
            const expiryRegex = /^(\d{2})\/(\d{2})$/;
            const match = expiryDate.match(expiryRegex);
            if (!match) {
                showFieldError('expiry-date', 'Formato inválido (use MM/AA)');
                isValid = false;
            } else {
                const month = parseInt(match[1]);
                const year = parseInt('20' + match[2]);
                const currentDate = new Date();
                const expiry = new Date(year, month - 1);
                
                if (month < 1 || month > 12) {
                    showFieldError('expiry-date', 'Mês inválido');
                    isValid = false;
                } else if (expiry < currentDate) {
                    showFieldError('expiry-date', 'Cartão expirado');
                    isValid = false;
                }
            }
        }
        
        // Validar CVV
        if (!cvv || !cvv.trim()) {
            showFieldError('cvv', 'CVV é obrigatório');
            isValid = false;
        } else {
            const cleanCvv = cvv.replace(/\D/g, '');
            if (cleanCvv.length < 3 || cleanCvv.length > 4) {
                showFieldError('cvv', 'CVV inválido');
                isValid = false;
            }
        }
    }
    
    // Validar CEP
    if (!validateCEP(formData.get('cep'))) {
        isValid = false;
    }
    
    // Validar email
    if (!validateEmail(formData.get('email'))) {
        isValid = false;
    }
    
    // Validar CPF
    if (!validateCPF(formData.get('cpf'))) {
        isValid = false;
    }
    
    return isValid;
}

// ===== CONFIGURAÇÃO DA API =====
// URL do backend - ajustar conforme necessário
const API_BASE_URL = 'http://localhost:3000/api';

// ===== PROCESSAMENTO DE PAGAMENTO REAL =====
// Agora usando backend com Mercado Pago

async function processPayment() {
    const form = document.getElementById('payment-form');
    const formData = new FormData(form);
    const paymentMethod = formData.get('payment-method');
    
    try {
        // Preparar dados do pedido
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const orderTotal = parseFloat(localStorage.getItem('orderTotal')) || 0;
        
        const orderData = {
            items: cartItems.map(item => {
                const normalized = normalizeCartItem(item);
                return {
                    nome: normalized.nome,
                    quantidade: normalized.quantidade,
                    preco: normalized.preco
                };
            }),
            total: orderTotal,
            customer: {
                fullName: formData.get('full-name'),
                email: formData.get('email'),
                cpf: formData.get('cpf'),
                phone: formData.get('phone')
            },
            address: {
                cep: formData.get('cep'),
                estado: formData.get('estado'),
                cidade: formData.get('cidade'),
                bairro: formData.get('bairro'),
                rua: formData.get('rua'),
                numero: formData.get('numero'),
                complemento: formData.get('complemento')
            },
            installments: parseInt(formData.get('installments') || 1)
        };
        
        // Processar pagamento baseado no método escolhido
        if (paymentMethod === 'credit-card' || paymentMethod === 'debit-card') {
            // Processar com cartão usando Mercado Pago
            await processCardPayment(orderData, formData);
        } else if (paymentMethod === 'pix') {
            // Processar PIX
            await processPixPayment(orderData);
        } else if (paymentMethod === 'boleto') {
            // Processar Boleto
            await processBoletoPayment(orderData);
        } else {
            throw new Error('Método de pagamento não suportado');
        }
        
    } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        showNotification(error.message || 'Erro ao processar pagamento. Tente novamente.', 'error');
        
        // Reabilitar botão
        const submitBtn = document.querySelector('.btn-finalizar');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-lock"></i> Finalizar Pedido';
        }
    }
}

// Processar pagamento com cartão
async function processCardPayment(orderData, formData) {
    // Verificar se Mercado Pago SDK está disponível
    if (typeof MercadoPago === 'undefined') {
        throw new Error('SDK do Mercado Pago não carregado. Adicione o script no HTML.');
    }
    
    // Obter Public Key do backend (ou configurar diretamente)
    const publicKey = await getMercadoPagoPublicKey();
    
    if (!publicKey) {
        throw new Error('Public Key do Mercado Pago não configurada. Configure no arquivo .env do backend.');
    }
    
    // Inicializar Mercado Pago
    const mp = new MercadoPago(publicKey, {
        locale: 'pt-BR'
    });
    
    // Obter dados do cartão do formulário
    const cardNumber = formData.get('card-number').replace(/\s/g, '');
    const cardName = formData.get('card-name');
    const expiryDate = formData.get('expiry-date');
    const cvv = formData.get('cvv');
    
    // Validar formato da data
    const expiryParts = expiryDate.split('/');
    if (expiryParts.length !== 2) {
        throw new Error('Data de validade inválida');
    }
    
    const cardExpirationMonth = expiryParts[0];
    const cardExpirationYear = '20' + expiryParts[1];
    
    showNotification('Tokenizando cartão...', 'info');
    
    // Criar token do cartão usando a API do Mercado Pago
    // Tokenização segura - dados nunca chegam ao nosso servidor em texto claro
    try {
        // Preparar dados para tokenização (formato esperado pela API do Mercado Pago)
        const tokenData = {
            card_number: cardNumber,
            cardholder: {
                name: cardName,
                identification: {
                    type: 'CPF',
                    number: orderData.customer.cpf.replace(/\D/g, '')
                }
            },
            card_expiration_month: cardExpirationMonth,
            card_expiration_year: cardExpirationYear,
            security_code: cvv,
            site_id: 'MLB' // Brasil - Mercado Livre Brasil
        };
        
        // Criar token usando a API REST do Mercado Pago (mais confiável)
        // Usar Public Key para tokenizar (dados vão direto para Mercado Pago)
        const tokenResponse = await fetch('https://api.mercadopago.com/v1/card_tokens?public_key=' + encodeURIComponent(publicKey), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tokenData)
        });
        
        const tokenResult = await tokenResponse.json();
        
        if (!tokenResponse.ok || !tokenResult.id) {
            const errorMsg = tokenResult.message || tokenResult.error || 'Erro ao validar cartão';
            throw new Error(errorMsg);
        }
        
        // Token criado com sucesso!
        const cardToken = tokenResult.id;
        
        showNotification('Processando pagamento...', 'info');
        
        // Identificar bandeira do cartão
        const cardBrand = getCardBrand(cardNumber);
        const paymentMethodId = cardBrand === 'amex' ? 'amex' : 
                               cardBrand === 'elo' ? 'elo' : 
                               cardBrand === 'hipercard' ? 'hipercard' :
                               cardBrand === 'mastercard' ? 'master' : 'visa';
        
        // Enviar para backend processar
        const paymentData = {
            token: cardToken,
            payment_method_id: paymentMethodId,
            installments: parseInt(formData.get('installments') || 1),
            issuer_id: null // Será identificado automaticamente pelo Mercado Pago
        };
        
        const response = await fetch(`${API_BASE_URL}/payment/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderData: orderData,
                paymentData: paymentData
            })
        });
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || result.error || 'Erro ao processar pagamento');
        }
        
        // Sucesso!
        handlePaymentSuccess(result, orderData);
        
    } catch (error) {
        console.error('Erro ao processar cartão:', error);
        
        // Mensagens de erro mais amigáveis
        let errorMessage = 'Erro ao processar pagamento. ';
        
        if (error.message.includes('token')) {
            errorMessage += 'Erro ao validar cartão. Verifique os dados.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage += 'Erro de conexão. Verifique se o backend está rodando.';
        } else {
            errorMessage += error.message;
        }
        
        throw new Error(errorMessage);
    }
}

// Processar PIX
async function processPixPayment(orderData) {
    // Criar preferência de pagamento para PIX
    const response = await fetch(`${API_BASE_URL}/payment/create-preference`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...orderData,
            paymentType: 'pix'
        })
    });
    
    const result = await response.json();
    
    if (!result.success) {
        throw new Error(result.error || 'Erro ao criar pagamento PIX');
    }
    
    // Redirecionar para checkout do Mercado Pago
    const checkoutUrl = process.env.MERCADOPAGO_MODE === 'sandbox' 
        ? result.sandboxInitPoint 
        : result.initPoint;
    
    window.location.href = checkoutUrl;
}

// Processar Boleto
async function processBoletoPayment(orderData) {
    // Criar preferência de pagamento para Boleto
    const response = await fetch(`${API_BASE_URL}/payment/create-preference`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...orderData,
            paymentType: 'bolbradesco' // ou 'pec'
        })
    });
    
    const result = await response.json();
    
    if (!result.success) {
        throw new Error(result.error || 'Erro ao criar boleto');
    }
    
    // Redirecionar para checkout do Mercado Pago
    const checkoutUrl = process.env.MERCADOPAGO_MODE === 'sandbox' 
        ? result.sandboxInitPoint 
        : result.initPoint;
    
    window.location.href = checkoutUrl;
}

// Obter Public Key do backend
async function getMercadoPagoPublicKey() {
    try {
        // Tentar obter do backend
        const backendUrl = API_BASE_URL.replace('/api', '');
        const response = await fetch(`${backendUrl}/api/mercadopago/public-key`);
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.publicKey) {
                // Salvar no localStorage para cache
                localStorage.setItem('mercadopago_public_key', data.publicKey);
                return data.publicKey;
            }
        }
    } catch (error) {
        console.warn('Não foi possível obter Public Key do backend, usando cache ou fallback');
    }
    
    // Tentar usar do cache (localStorage)
    const cachedKey = localStorage.getItem('mercadopago_public_key');
    if (cachedKey) {
        return cachedKey;
    }
    
    // Se não conseguir, mostrar erro claro
    console.error('⚠️ Public Key do Mercado Pago não configurada!');
    console.error('💡 Configure no arquivo .env do backend ou execute:');
    console.error('   localStorage.setItem("mercadopago_public_key", "SUA_PUBLIC_KEY")');
    
    return null;
}

// Tratar sucesso do pagamento
function handlePaymentSuccess(result, orderData) {
    // Criar objeto de pedido
    const order = {
        id: result.orderId,
        date: new Date().toISOString(),
        items: orderData.items.map(item => normalizeCartItem(item)),
        total: orderData.total,
        paymentMethod: 'credit-card',
        paymentId: result.paymentId,
        paymentStatus: result.status,
        address: orderData.address,
        contact: orderData.customer,
        status: result.status === 'approved' ? 'confirmed' : 'pending'
    };
    
    // Salvar pedido
    saveOrder(order);
    
    // Limpar carrinho
    localStorage.removeItem('cartItems');
    
    // Salvar ID do pedido atual
    localStorage.setItem('currentOrderId', order.id);
    
    // Notificar sucesso
    showNotification(result.message || 'Pagamento aprovado!', 'success');
    
    // Redirecionar
    setTimeout(() => {
        window.location.href = 'confirmacao.html';
    }, 2000);
}

function createOrder(formData, paymentMethod) {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const orderTotal = parseFloat(localStorage.getItem('orderTotal')) || 0;
    
    // Normalizar itens do carrinho
    const normalizedItems = cartItems.map(item => normalizeCartItem(item));
    
    const order = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        items: normalizedItems,
        total: orderTotal,
        paymentMethod: paymentMethod,
        address: {
            cep: formData.get('cep'),
            estado: formData.get('estado'),
            cidade: formData.get('cidade'),
            bairro: formData.get('bairro'),
            rua: formData.get('rua'),
            numero: formData.get('numero'),
            complemento: formData.get('complemento')
        },
        contact: {
            fullName: formData.get('full-name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            cpf: formData.get('cpf')
        },
        status: 'pending'
    };
    
    // Adicionar dados do cartão se aplicável
    if (paymentMethod === 'credit-card' || paymentMethod === 'debit-card') {
        order.cardDetails = {
            number: formData.get('card-number'),
            name: formData.get('card-name'),
            expiry: formData.get('expiry-date'),
            cvv: formData.get('cvv'),
            installments: formData.get('installments')
        };
    }
    
    return order;
}

function saveOrder(order) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Salvar ID do pedido atual
    localStorage.setItem('currentOrderId', order.id);
}

// ===== CARREGAR DADOS DO USUÁRIO =====

function loadUserData() {
    const userId = localStorage.getItem('currentUserId');
    
    if (!userId) return;
    
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(u => u.id.toString() === userId);
    
    if (!usuario) return;
    
    // Preencher campos com dados do usuário
    const fields = {
        'full-name': usuario.nome,
        'email': usuario.email,
        'phone': usuario.telefone,
        'cpf': usuario.cpf,
        'cep': usuario.endereco?.cep || '',
        'estado': usuario.endereco?.estado || '',
        'cidade': usuario.endereco?.cidade || '',
        'bairro': usuario.endereco?.bairro || '',
        'rua': usuario.endereco?.rua || '',
        'numero': usuario.endereco?.numero || '',
        'complemento': usuario.endereco?.complemento || ''
    };
    
    Object.keys(fields).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && fields[fieldId]) {
            field.value = fields[fieldId];
        }
    });
}

// ===== FUNÇÕES AUXILIARES =====

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// ===== BUSCA CEP (OPCIONAL) =====

function searchCEP(cep) {
    // Remove formatação
    cep = cep.replace(/\D/g, '');
    
    if (cep.length !== 8) return;
    
    // Simular busca de CEP (em produção, usar API real)
    const mockCEPData = {
        '01234567': {
            logradouro: 'Rua das Flores',
            bairro: 'Vila Madalena',
            localidade: 'São Paulo',
            uf: 'SP'
        }
    };
    
    const data = mockCEPData[cep];
    if (data) {
        document.getElementById('rua').value = data.logradouro;
        document.getElementById('bairro').value = data.bairro;
        document.getElementById('cidade').value = data.localidade;
        document.getElementById('estado').value = data.uf;
    }
}

// Configurar busca automática de CEP
document.addEventListener('DOMContentLoaded', function() {
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('blur', function() {
            if (this.value.length === 9) { // 00000-000
                searchCEP(this.value);
            }
        });
    }
});

