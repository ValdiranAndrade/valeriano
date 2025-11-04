// ===== SISTEMA DE LOGIN =====

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== LOGIN PAGE LOADED ===');
    
    // Inicializar funcionalidades do login
    initLoginForm();
    
    // Verificar se já está logado
    checkIfAlreadyLoggedIn();
});

// ===== VERIFICAÇÃO DE LOGIN =====

function checkIfAlreadyLoggedIn() {
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    if (isLoggedIn === 'true') {
        showNotification('Você já está logado!', 'info');
        setTimeout(() => {
            window.location.href = 'perfil.html';
        }, 1500);
    }
}

// ===== FORMULÁRIO DE LOGIN =====

function initLoginForm() {
    const form = document.getElementById('loginForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            processarLogin();
        });
        
        // Validação em tempo real
        const emailInput = document.getElementById('email');
        const senhaInput = document.getElementById('senha');
        
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                validarEmail(this);
            });
            
            emailInput.addEventListener('input', function() {
                limparErro(this);
            });
        }
        
        if (senhaInput) {
            senhaInput.addEventListener('blur', function() {
                validarSenha(this);
            });
            
            senhaInput.addEventListener('input', function() {
                limparErro(this);
            });
        }
    }
}

// ===== VALIDAÇÕES =====

function validarEmail(campo) {
    const valor = campo.value.trim();
    const errorElement = document.getElementById('email-error');
    
    let isValid = true;
    let errorMessage = '';
    
    if (!valor) {
        errorMessage = 'E-mail é obrigatório';
        isValid = false;
    } else if (!validarFormatoEmail(valor)) {
        errorMessage = 'E-mail inválido';
        isValid = false;
    }
    
    if (isValid) {
        limparErro(campo);
    } else {
        mostrarErro(campo, errorMessage);
    }
    
    return isValid;
}

function validarSenha(campo) {
    const valor = campo.value;
    const errorElement = document.getElementById('senha-error');
    
    let isValid = true;
    let errorMessage = '';
    
    if (!valor) {
        errorMessage = 'Senha é obrigatória';
        isValid = false;
    } else if (valor.length < 6) {
        errorMessage = 'Senha deve ter pelo menos 6 caracteres';
        isValid = false;
    }
    
    if (isValid) {
        limparErro(campo);
    } else {
        mostrarErro(campo, errorMessage);
    }
    
    return isValid;
}

function validarFormatoEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function mostrarErro(campo, mensagem) {
    const errorElement = document.getElementById(campo.id + '-error');
    if (errorElement) {
        errorElement.textContent = mensagem;
        errorElement.style.display = 'block';
    }
    
    campo.classList.add('error');
}

function limparErro(campo) {
    const errorElement = document.getElementById(campo.id + '-error');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
    
    campo.classList.remove('error');
}

// ===== PROCESSAMENTO DO LOGIN =====

function processarLogin() {
    const form = document.getElementById('loginForm');
    const formData = new FormData(form);
    
    const email = formData.get('email').trim();
    const senha = formData.get('senha');
    
    // Validar campos
    const emailValido = validarEmail(document.getElementById('email'));
    const senhaValida = validarSenha(document.getElementById('senha'));
    
    if (!emailValido || !senhaValida) {
        showNotification('Por favor, corrija os erros no formulário', 'error');
        return;
    }
    
    // Buscar usuário
    const usuario = buscarUsuario(email, senha);
    
    if (usuario) {
        // Login bem-sucedido
        fazerLogin(usuario);
        showNotification('Login realizado com sucesso!', 'success');
        
        // Redirecionar após 1 segundo
        setTimeout(() => {
            window.location.href = 'perfil.html';
        }, 1000);
    } else {
        // Login falhou
        showNotification('E-mail ou senha incorretos', 'error');
        
        // Destacar campos com erro
        document.getElementById('email').classList.add('error');
        document.getElementById('senha').classList.add('error');
    }
}

function buscarUsuario(email, senha) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    return usuarios.find(usuario => 
        usuario.email === email && 
        usuario.senha === senha && 
        usuario.ativo === true
    );
}

function fazerLogin(usuario) {
    // Salvar dados do usuário logado
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('currentUserId', usuario.id.toString());
    localStorage.setItem('userEmail', usuario.email);
    localStorage.setItem('userName', usuario.nome);
    
    // Salvar data do último login
    localStorage.setItem('lastLogin', new Date().toISOString());
    
    console.log('Usuário logado:', usuario);
}

// ===== FUNCIONALIDADES AUXILIARES =====

function togglePassword() {
    const senhaInput = document.getElementById('senha');
    const passwordIcon = document.getElementById('password-icon');
    
    if (senhaInput.type === 'password') {
        senhaInput.type = 'text';
        passwordIcon.className = 'fas fa-eye-slash';
    } else {
        senhaInput.type = 'password';
        passwordIcon.className = 'fas fa-eye';
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

// ===== FUNÇÕES AUXILIARES =====

// Função para obter usuário atual
function getCurrentUser() {
    const userId = localStorage.getItem('currentUserId');
    if (!userId) return null;
    
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    return usuarios.find(usuario => usuario.id.toString() === userId);
}

// Função para fazer logout
function logout() {
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

// Função para verificar se usuário está logado
function isUserLoggedIn() {
    return localStorage.getItem('userLoggedIn') === 'true';
}
