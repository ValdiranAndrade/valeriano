// ===== SISTEMA DE PERFIL =====

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== PERFIL PAGE LOADED ===');
    
    // Verificar se usuário está logado
    checkUserLogin();
    
    // Carregar dados do usuário
    loadUserData();
    
    // Carregar pedidos do usuário
    loadUserOrders();
    
    // Inicializar funcionalidades do perfil
    initProfileFeatures();
});

// ===== VERIFICAÇÃO DE LOGIN =====

function checkUserLogin() {
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    
    if (isLoggedIn !== 'true') {
        showNotification('Você precisa estar logado para acessar o perfil', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return false;
    }
    
    return true;
}

// ===== CARREGAMENTO DE DADOS =====

function loadUserData() {
    const userId = localStorage.getItem('currentUserId');
    
    if (!userId) {
        console.error('ID do usuário não encontrado');
        return;
    }
    
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(u => u.id.toString() === userId);
    
    if (!usuario) {
        console.error('Usuário não encontrado');
        showNotification('Erro ao carregar dados do usuário', 'error');
        return;
    }
    
    // Preencher dados pessoais
    fillPersonalData(usuario);
    
    // Preencher endereço
    fillAddressData(usuario.endereco);
    
    // Atualizar informações do header
    updateProfileHeader(usuario);
    
    console.log('Dados do usuário carregados:', usuario);
}

function fillPersonalData(usuario) {
    // Dados pessoais
    const nomeElement = document.querySelector('input[name="nome"]');
    const cpfElement = document.querySelector('input[name="cpf"]');
    const dataNascimentoElement = document.querySelector('input[name="dataNascimento"]');
    const telefoneElement = document.querySelector('input[name="telefone"]');
    const emailElement = document.querySelector('input[name="email"]');
    const generoElement = document.querySelector('select[name="genero"]');
    
    if (nomeElement) nomeElement.value = usuario.nome || '';
    if (cpfElement) cpfElement.value = usuario.cpf || '';
    if (dataNascimentoElement) dataNascimentoElement.value = usuario.dataNascimento || '';
    if (telefoneElement) telefoneElement.value = usuario.telefone || '';
    if (emailElement) emailElement.value = usuario.email || '';
    if (generoElement) generoElement.value = usuario.genero || 'masculino';
}

function fillAddressData(endereco) {
    if (!endereco) return;
    
    const cepElement = document.querySelector('input[name="cep"]');
    const estadoElement = document.querySelector('input[name="estado"]');
    const cidadeElement = document.querySelector('input[name="cidade"]');
    const bairroElement = document.querySelector('input[name="bairro"]');
    const ruaElement = document.querySelector('input[name="rua"]');
    const numeroElement = document.querySelector('input[name="numero"]');
    const complementoElement = document.querySelector('input[name="complemento"]');
    
    if (cepElement) cepElement.value = endereco.cep || '';
    if (estadoElement) estadoElement.value = endereco.estado || '';
    if (cidadeElement) cidadeElement.value = endereco.cidade || '';
    if (bairroElement) bairroElement.value = endereco.bairro || '';
    if (ruaElement) ruaElement.value = endereco.rua || '';
    if (numeroElement) numeroElement.value = endereco.numero || '';
    if (complementoElement) complementoElement.value = endereco.complemento || '';
}

function updateProfileHeader(usuario) {
    // Atualizar nome no header do perfil
    const profileName = document.querySelector('.profile-banner h1');
    if (profileName) {
        profileName.textContent = `OLÁ, ${usuario.nome.toUpperCase()}`;
    }
    
    // Atualizar email no header
    const profileEmail = document.querySelector('.profile-banner p');
    if (profileEmail) {
        profileEmail.textContent = usuario.email;
    }
}

// ===== UPLOAD DE FOTO =====

function setupPhotoUpload() {
    const photoInput = document.getElementById('photoInput');
    
    if (!photoInput) return;
    
    // Configurar event listener para quando uma foto for selecionada
    photoInput.addEventListener('change', handlePhotoSelect);
    
    // Carregar foto salva ao carregar a página
    loadAvatar();
}

function handlePhotoSelect(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
        showNotification('Por favor, selecione uma imagem válida', 'error');
        return;
    }
    
    // Validar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('A imagem deve ter no máximo 5MB', 'error');
        return;
    }
    
    // Ler arquivo como base64
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const imageData = e.target.result;
        
        // Exibir preview
        displayAvatar(imageData);
        
        // Salvar no localStorage
        saveAvatar(imageData);
        
        showNotification('Foto atualizada com sucesso!', 'success');
    };
    
    reader.onerror = function() {
        showNotification('Erro ao carregar a imagem', 'error');
    };
    
    reader.readAsDataURL(file);
}

function displayAvatar(imageData) {
    const avatarImage = document.getElementById('avatarImage');
    const avatarIcon = document.getElementById('avatarIcon');
    const avatarPreview = document.getElementById('avatarPreview');
    
    if (avatarImage && avatarIcon && avatarPreview) {
        if (imageData) {
            avatarImage.src = imageData;
            avatarImage.style.display = 'block';
            avatarIcon.style.display = 'none';
            avatarPreview.classList.add('has-image');
        } else {
            avatarImage.style.display = 'none';
            avatarIcon.style.display = 'block';
            avatarPreview.classList.remove('has-image');
        }
    }
}

function saveAvatar(imageData) {
    const userId = localStorage.getItem('currentUserId');
    
    if (!userId) {
        // Salvar temporariamente se não houver usuário logado
        localStorage.setItem('tempAvatar', imageData);
        return;
    }
    
    // Salvar avatar do usuário
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuarioIndex = usuarios.findIndex(u => u.id.toString() === userId);
    
    if (usuarioIndex !== -1) {
        usuarios[usuarioIndex].avatar = imageData;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
}

function loadAvatar() {
    const userId = localStorage.getItem('currentUserId');
    let imageData = null;
    
    if (userId) {
        // Carregar avatar do usuário
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        const usuario = usuarios.find(u => u.id.toString() === userId);
        
        if (usuario && usuario.avatar) {
            imageData = usuario.avatar;
        }
    } else {
        // Carregar avatar temporário
        imageData = localStorage.getItem('tempAvatar');
    }
    
    if (imageData) {
        displayAvatar(imageData);
    }
}

// ===== FUNCIONALIDADES DO PERFIL =====

function initProfileFeatures() {
    // Configurar botão de logout
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Configurar botões de edição do perfil
    const profileEditBtn = document.querySelector('#profile-section .btn-edit');
    if (profileEditBtn) {
        profileEditBtn.addEventListener('click', function(e) {
            e.preventDefault();
            enableEditMode();
        });
    }
    
    // Configurar botões de edição do endereço
    const addressEditBtn = document.querySelector('#addresses-section .btn-edit-address');
    if (addressEditBtn) {
        addressEditBtn.addEventListener('click', function(e) {
            e.preventDefault();
            enableAddressEditMode();
        });
    }
    
    // Configurar botões de salvar do perfil
    const profileSaveBtn = document.querySelector('#profile-section .btn-save');
    if (profileSaveBtn) {
        profileSaveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            saveUserData();
        });
    }
    
    // Configurar botões de salvar do endereço
    const addressSaveBtn = document.querySelector('#addresses-section .btn-save');
    if (addressSaveBtn) {
        addressSaveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            saveAddress();
        });
    }
    
    // Configurar botões de cancelar
    const cancelBtns = document.querySelectorAll('.btn-cancel');
    cancelBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            cancelEdit();
        });
    });
    
    // Configurar upload de foto
    setupPhotoUpload();
}

// ===== MODO DE EDIÇÃO =====

function enableEditMode() {
    // Habilitar campos de edição do perfil
    const profileInputs = document.querySelectorAll('#profile-form input, #profile-form select');
    profileInputs.forEach(input => {
        input.removeAttribute('readonly');
        input.disabled = false;
    });
    
    // Mostrar botões de salvar/cancelar do perfil
    const profileSaveBtn = document.querySelector('#profile-section .btn-save');
    const profileCancelBtn = document.querySelector('#profile-section .btn-cancel');
    const profileEditBtn = document.querySelector('#profile-section .btn-edit');
    
    if (profileSaveBtn) profileSaveBtn.style.display = 'flex';
    if (profileCancelBtn) profileCancelBtn.style.display = 'flex';
    if (profileEditBtn) profileEditBtn.style.display = 'none';
    
    showNotification('Modo de edição ativado', 'info');
}

function enableAddressEditMode() {
    // Habilitar campos de edição do endereço
    const addressInputs = document.querySelectorAll('#address-form input');
    addressInputs.forEach(input => {
        input.removeAttribute('readonly');
        input.disabled = false;
    });
    
    // Mostrar botões de salvar/cancelar do endereço
    const addressSaveBtn = document.querySelector('#addresses-section .btn-save');
    const addressCancelBtn = document.querySelector('#addresses-section .btn-cancel');
    const addressEditBtn = document.querySelector('#addresses-section .btn-edit-address');
    
    if (addressSaveBtn) addressSaveBtn.style.display = 'flex';
    if (addressCancelBtn) addressCancelBtn.style.display = 'flex';
    if (addressEditBtn) addressEditBtn.style.display = 'none';
    
    showNotification('Modo de edição do endereço ativado', 'info');
}

function toggleEditMode(section) {
    if (section === 'profile') {
        enableEditMode();
    } else if (section === 'address') {
        enableAddressEditMode();
    }
}

function cancelEdit() {
    // Recarregar dados originais
    loadUserData();
    
    // Desabilitar campos do perfil
    const profileInputs = document.querySelectorAll('#profile-form input, #profile-form select');
    profileInputs.forEach(input => {
        input.setAttribute('readonly', 'readonly');
        input.disabled = true;
    });
    
    // Desabilitar campos do endereço
    const addressInputs = document.querySelectorAll('#address-form input');
    addressInputs.forEach(input => {
        input.setAttribute('readonly', 'readonly');
        input.disabled = true;
    });
    
    // Mostrar botões de edição do perfil
    const profileSaveBtn = document.querySelector('#profile-section .btn-save');
    const profileCancelBtn = document.querySelector('#profile-section .btn-cancel');
    const profileEditBtn = document.querySelector('#profile-section .btn-edit');
    
    if (profileSaveBtn) profileSaveBtn.style.display = 'none';
    if (profileCancelBtn) profileCancelBtn.style.display = 'none';
    if (profileEditBtn) profileEditBtn.style.display = 'flex';
    
    // Mostrar botões de edição do endereço
    const addressSaveBtn = document.querySelector('#addresses-section .btn-save');
    const addressCancelBtn = document.querySelector('#addresses-section .btn-cancel');
    const addressEditBtn = document.querySelector('#addresses-section .btn-edit-address');
    
    if (addressSaveBtn) addressSaveBtn.style.display = 'none';
    if (addressCancelBtn) addressCancelBtn.style.display = 'none';
    if (addressEditBtn) addressEditBtn.style.display = 'flex';
    
    showNotification('Edição cancelada', 'info');
}

// ===== SALVAR DADOS =====

function saveUserData() {
    const userId = localStorage.getItem('currentUserId');
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuarioIndex = usuarios.findIndex(u => u.id.toString() === userId);
    
    if (usuarioIndex === -1) {
        showNotification('Erro ao encontrar usuário', 'error');
        return;
    }
    
    // Coletar dados do formulário de perfil
    const profileForm = document.getElementById('profile-form');
    const formData = new FormData(profileForm);
    
    // Atualizar dados pessoais
    usuarios[usuarioIndex].nome = formData.get('nome') || usuarios[usuarioIndex].nome;
    usuarios[usuarioIndex].cpf = formData.get('cpf') || usuarios[usuarioIndex].cpf;
    usuarios[usuarioIndex].dataNascimento = formData.get('dataNascimento') || usuarios[usuarioIndex].dataNascimento;
    usuarios[usuarioIndex].telefone = formData.get('telefone') || usuarios[usuarioIndex].telefone;
    usuarios[usuarioIndex].email = formData.get('email') || usuarios[usuarioIndex].email;
    usuarios[usuarioIndex].genero = formData.get('genero') || usuarios[usuarioIndex].genero;
    
    // Salvar no localStorage
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    // Atualizar dados de login
    localStorage.setItem('userName', usuarios[usuarioIndex].nome);
    localStorage.setItem('userEmail', usuarios[usuarioIndex].email);
    
    // Sair do modo de edição
    cancelEdit();
    
    showNotification('Dados pessoais salvos com sucesso!', 'success');
}

function saveAddress() {
    const userId = localStorage.getItem('currentUserId');
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuarioIndex = usuarios.findIndex(u => u.id.toString() === userId);
    
    if (usuarioIndex === -1) {
        showNotification('Erro ao encontrar usuário', 'error');
        return;
    }
    
    // Coletar dados do formulário de endereço
    const addressForm = document.getElementById('address-form');
    const formData = new FormData(addressForm);
    
    // Atualizar endereço
    usuarios[usuarioIndex].endereco = {
        cep: formData.get('cep') || usuarios[usuarioIndex].endereco.cep,
        estado: formData.get('estado') || usuarios[usuarioIndex].endereco.estado,
        cidade: formData.get('cidade') || usuarios[usuarioIndex].endereco.cidade,
        bairro: formData.get('bairro') || usuarios[usuarioIndex].endereco.bairro,
        rua: formData.get('rua') || usuarios[usuarioIndex].endereco.rua,
        numero: formData.get('numero') || usuarios[usuarioIndex].endereco.numero,
        complemento: formData.get('complemento') || usuarios[usuarioIndex].endereco.complemento
    };
    
    // Salvar no localStorage
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    // Sair do modo de edição
    cancelEdit();
    
    showNotification('Endereço salvo com sucesso!', 'success');
}

// Função para compatibilidade com o HTML
function saveProfile() {
    saveUserData();
}

// ===== LOGOUT =====

function logout() {
    if (confirm('Tem certeza que deseja sair da sua conta?')) {
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('currentUserId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('lastLogin');
        
        showNotification('Logout realizado com sucesso', 'info');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// ===== NAVEGAÇÃO DO PERFIL =====

function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.profile-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Recarregar pedidos se a seção de pedidos for exibida
    if (sectionName === 'orders-section') {
        loadUserOrders();
    }
    
    // Update navigation
    const navItems = document.querySelectorAll('.profile-nav-menu a');
    navItems.forEach(item => {
        item.parentElement.classList.remove('active');
    });
    
    const activeNavItem = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (activeNavItem) {
        activeNavItem.parentElement.classList.add('active');
    }
}

// ===== NOTIFICAÇÕES =====

function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        font-size: 0.9rem;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 4 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// ===== CARREGAR PEDIDOS DO USUÁRIO =====

function loadUserOrders() {
    const userId = localStorage.getItem('currentUserId');
    
    if (!userId) {
        showNoOrdersMessage();
        return;
    }
    
    // Buscar todos os pedidos
    const allOrders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Filtrar pedidos do usuário logado
    const userOrders = allOrders.filter(order => order.userId === userId);
    
    // Ordenar por data (mais recente primeiro)
    userOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Renderizar pedidos
    renderOrders(userOrders);
}

function renderOrders(orders) {
    const ordersList = document.getElementById('orders-list');
    const noOrdersMessage = document.getElementById('no-orders-message');
    
    if (!ordersList) return;
    
    // Limpar lista
    ordersList.innerHTML = '';
    
    if (orders.length === 0) {
        // Mostrar mensagem quando não houver pedidos
        showNoOrdersMessage();
        return;
    }
    
    // Esconder mensagem de sem pedidos
    if (noOrdersMessage) {
        noOrdersMessage.style.display = 'none';
    }
    
    // Renderizar cada pedido
    orders.forEach(order => {
        const orderItem = createOrderItem(order);
        ordersList.appendChild(orderItem);
    });
}

function createOrderItem(order) {
    const orderDiv = document.createElement('div');
    orderDiv.className = 'order-item';
    
    // Formatar data
    const orderDate = new Date(order.date);
    const formattedDate = orderDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    // Formatar número do pedido
    const orderNumber = order.id ? `#VAL-${order.id.slice(-6)}` : '#VAL-N/A';
    
    // Determinar status e classe CSS
    let statusText = 'Pendente';
    let statusClass = 'pending';
    
    if (order.status) {
        switch(order.status.toLowerCase()) {
            case 'confirmed':
            case 'approved':
                statusText = 'Confirmado';
                statusClass = 'confirmed';
                break;
            case 'shipping':
            case 'in_transit':
                statusText = 'Em Trânsito';
                statusClass = 'shipping';
                break;
            case 'delivered':
                statusText = 'Entregue';
                statusClass = 'delivered';
                break;
            case 'cancelled':
            case 'rejected':
                statusText = 'Cancelado';
                statusClass = 'cancelled';
                break;
            default:
                statusText = 'Pendente';
                statusClass = 'pending';
        }
    }
    
    // Formatar total
    const total = order.total ? `R$ ${parseFloat(order.total).toFixed(2).replace('.', ',')}` : 'R$ 0,00';
    
    orderDiv.innerHTML = `
        <div class="order-info">
            <div class="order-number">
                <span class="label">Pedido:</span>
                <span class="value">${orderNumber}</span>
            </div>
            <div class="order-date">
                <span class="label">Data:</span>
                <span class="value">${formattedDate}</span>
            </div>
            <div class="order-status">
                <span class="status ${statusClass}">${statusText}</span>
            </div>
        </div>
        <div class="order-total">
            <span class="label">Total:</span>
            <span class="value">${total}</span>
        </div>
        <div class="order-actions">
            <button class="btn-view-order" onclick="viewOrderDetails('${order.id}')">Ver Detalhes</button>
        </div>
    `;
    
    return orderDiv;
}

function showNoOrdersMessage() {
    const ordersList = document.getElementById('orders-list');
    const noOrdersMessage = document.getElementById('no-orders-message');
    
    if (ordersList) {
        ordersList.innerHTML = '';
    }
    
    if (noOrdersMessage) {
        noOrdersMessage.style.display = 'block';
    }
}

function viewOrderDetails(orderId) {
    // Buscar pedido
    const allOrders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = allOrders.find(o => o.id === orderId);
    
    if (!order) {
        showNotification('Pedido não encontrado', 'error');
        return;
    }
    
    // Criar mensagem com detalhes do pedido
    let details = `Pedido: #VAL-${orderId.slice(-6)}\n\n`;
    details += `Data: ${new Date(order.date).toLocaleDateString('pt-BR')}\n`;
    details += `Total: R$ ${parseFloat(order.total || 0).toFixed(2).replace('.', ',')}\n\n`;
    
    if (order.items && order.items.length > 0) {
        details += 'Itens:\n';
        order.items.forEach(item => {
            details += `- ${item.name || item.title || 'Produto'} (${item.quantity || 1}x) - R$ ${parseFloat(item.price || 0).toFixed(2).replace('.', ',')}\n`;
        });
    }
    
    if (order.address) {
        details += `\nEndereço de entrega:\n`;
        details += `${order.address.rua || ''}, ${order.address.numero || ''}\n`;
        details += `${order.address.bairro || ''}, ${order.address.cidade || ''} - ${order.address.estado || ''}\n`;
        details += `CEP: ${order.address.cep || ''}\n`;
    }
    
    alert(details);
}

// ===== FUNÇÕES AUXILIARES =====

// Função para obter usuário atual
function getCurrentUser() {
    const userId = localStorage.getItem('currentUserId');
    if (!userId) return null;
    
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    return usuarios.find(usuario => usuario.id.toString() === userId);
}

// Função para verificar se usuário está logado
function isUserLoggedIn() {
    return localStorage.getItem('userLoggedIn') === 'true';
}
