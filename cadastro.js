// ===== SISTEMA DE CADASTRO =====

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== CADASTRO PAGE LOADED ===');
    
    // Inicializar funcionalidades do cadastro
    initCadastroForm();
    initMasks();
    initPasswordStrength();
    initCepLookup();
});

// ===== VALIDAÇÕES =====

// Validação de CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

// Validação de email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validação de senha
function validarSenha(senha) {
    return senha.length >= 6;
}

// Validação de telefone
function validarTelefone(telefone) {
    const regex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return regex.test(telefone);
}

// Validação de CEP
function validarCEP(cep) {
    const regex = /^\d{5}-?\d{3}$/;
    return regex.test(cep);
}

// ===== MÁSCARAS =====

function initMasks() {
    // Máscara para CPF
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        });
    }
    
    // Máscara para telefone
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{4,5})(\d{4})$/, '$1-$2');
            e.target.value = value;
        });
    }
    
    // Máscara para CEP
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = value;
        });
    }
}

// ===== FORÇA DA SENHA =====

function initPasswordStrength() {
    const senhaInput = document.getElementById('senha');
    const strengthDiv = document.getElementById('password-strength');
    
    if (senhaInput && strengthDiv) {
        senhaInput.addEventListener('input', function() {
            const senha = this.value;
            const strength = calcularForcaSenha(senha);
            mostrarForcaSenha(strength, strengthDiv);
        });
    }
}

function calcularForcaSenha(senha) {
    let score = 0;
    
    if (senha.length >= 6) score += 1;
    if (senha.length >= 8) score += 1;
    if (/[a-z]/.test(senha)) score += 1;
    if (/[A-Z]/.test(senha)) score += 1;
    if (/[0-9]/.test(senha)) score += 1;
    if (/[^A-Za-z0-9]/.test(senha)) score += 1;
    
    return score;
}

function mostrarForcaSenha(strength, element) {
    element.innerHTML = '';
    
    const levels = [
        { text: 'Muito fraca', class: 'very-weak', color: '#dc3545' },
        { text: 'Fraca', class: 'weak', color: '#fd7e14' },
        { text: 'Regular', class: 'regular', color: '#ffc107' },
        { text: 'Boa', class: 'good', color: '#20c997' },
        { text: 'Muito boa', class: 'very-good', color: '#198754' },
        { text: 'Excelente', class: 'excellent', color: '#0d6efd' }
    ];
    
    const level = levels[Math.min(strength, levels.length - 1)];
    
    element.innerHTML = `
        <div class="strength-bar">
            <div class="strength-fill" style="width: ${(strength / 6) * 100}%; background-color: ${level.color};"></div>
        </div>
        <span class="strength-text" style="color: ${level.color};">${level.text}</span>
    `;
}

// ===== BUSCA DE CEP =====

function initCepLookup() {
    const cepInput = document.getElementById('cep');
    
    if (cepInput) {
        cepInput.addEventListener('blur', function() {
            const cep = this.value.replace(/\D/g, '');
            
            if (cep.length === 8) {
                buscarCEP(cep);
            }
        });
    }
}

async function buscarCEP(cep) {
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
            document.getElementById('estado').value = data.uf;
            document.getElementById('cidade').value = data.localidade;
            document.getElementById('bairro').value = data.bairro;
            document.getElementById('rua').value = data.logradouro;
        } else {
            showNotification('CEP não encontrado', 'error');
        }
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        showNotification('Erro ao buscar CEP', 'error');
    }
}

// ===== FORMULÁRIO DE CADASTRO =====

function initCadastroForm() {
    const form = document.getElementById('cadastroForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            processarCadastro();
            // O formulário também será enviado para o Formspree após processar localmente
        });
        
        // Validação em tempo real
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validarCampo(this);
            });
            
            input.addEventListener('input', function() {
                limparErro(this);
            });
        });
    }
}

function validarCampo(campo) {
    const valor = campo.value.trim();
    const campoId = campo.id;
    const errorElement = document.getElementById(campoId + '-error');
    
    let isValid = true;
    let errorMessage = '';
    
    // Validações específicas por campo
    switch (campoId) {
        case 'nome':
            if (!valor) {
                errorMessage = 'Nome é obrigatório';
                isValid = false;
            } else if (valor.length < 2) {
                errorMessage = 'Nome deve ter pelo menos 2 caracteres';
                isValid = false;
            }
            break;
            
        case 'cpf':
            if (!valor) {
                errorMessage = 'CPF é obrigatório';
                isValid = false;
            } else if (!validarCPF(valor)) {
                errorMessage = 'CPF inválido';
                isValid = false;
            }
            break;
            
        case 'dataNascimento':
            if (!valor) {
                errorMessage = 'Data de nascimento é obrigatória';
                isValid = false;
            } else {
                const dataNasc = new Date(valor);
                const hoje = new Date();
                const idade = hoje.getFullYear() - dataNasc.getFullYear();
                
                if (idade < 18) {
                    errorMessage = 'Você deve ter pelo menos 18 anos';
                    isValid = false;
                }
            }
            break;
            
        case 'telefone':
            if (!valor) {
                errorMessage = 'Telefone é obrigatório';
                isValid = false;
            } else if (!validarTelefone(valor)) {
                errorMessage = 'Telefone inválido';
                isValid = false;
            }
            break;
            
        case 'email':
            if (!valor) {
                errorMessage = 'E-mail é obrigatório';
                isValid = false;
            } else if (!validarEmail(valor)) {
                errorMessage = 'E-mail inválido';
                isValid = false;
            } else if (emailJaCadastrado(valor)) {
                errorMessage = 'Este e-mail já está cadastrado';
                isValid = false;
            }
            break;
            
        case 'confirmarEmail':
            const email = document.getElementById('email').value;
            if (!valor) {
                errorMessage = 'Confirmação de e-mail é obrigatória';
                isValid = false;
            } else if (valor !== email) {
                errorMessage = 'E-mails não coincidem';
                isValid = false;
            }
            break;
            
        case 'senha':
            if (!valor) {
                errorMessage = 'Senha é obrigatória';
                isValid = false;
            } else if (!validarSenha(valor)) {
                errorMessage = 'Senha deve ter pelo menos 6 caracteres';
                isValid = false;
            }
            break;
            
        case 'confirmarSenha':
            const senha = document.getElementById('senha').value;
            if (!valor) {
                errorMessage = 'Confirmação de senha é obrigatória';
                isValid = false;
            } else if (valor !== senha) {
                errorMessage = 'Senhas não coincidem';
                isValid = false;
            }
            break;
            
        case 'cep':
            if (!valor) {
                errorMessage = 'CEP é obrigatório';
                isValid = false;
            } else if (!validarCEP(valor)) {
                errorMessage = 'CEP inválido';
                isValid = false;
            }
            break;
            
        case 'estado':
        case 'cidade':
        case 'bairro':
        case 'rua':
        case 'numero':
            if (!valor) {
                errorMessage = 'Este campo é obrigatório';
                isValid = false;
            }
            break;
            
        case 'aceitarTermos':
            if (!campo.checked) {
                errorMessage = 'Você deve aceitar os termos de uso';
                isValid = false;
            }
            break;
    }
    
    if (isValid) {
        limparErro(campo);
    } else {
        mostrarErro(campo, errorMessage);
    }
    
    return isValid;
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

function emailJaCadastrado(email) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    return usuarios.some(usuario => usuario.email === email);
}

// ===== PROCESSAMENTO DO CADASTRO =====

function processarCadastro() {
    const form = document.getElementById('cadastroForm');
    const formData = new FormData(form);
    
    // Validar todos os campos
    let todosValidos = true;
    const camposObrigatorios = [
        'nome', 'cpf', 'dataNascimento', 'telefone', 'email', 
        'confirmarEmail', 'senha', 'confirmarSenha', 'cep', 
        'estado', 'cidade', 'bairro', 'rua', 'numero', 'aceitarTermos'
    ];
    
    camposObrigatorios.forEach(campoId => {
        const campo = document.getElementById(campoId);
        if (campo && !validarCampo(campo)) {
            todosValidos = false;
        }
    });
    
    if (!todosValidos) {
        showNotification('Por favor, corrija os erros no formulário', 'error');
        return;
    }
    
    // Criar objeto do usuário
    const usuario = {
        id: Date.now(),
        nome: formData.get('nome'),
        cpf: formData.get('cpf'),
        dataNascimento: formData.get('dataNascimento'),
        telefone: formData.get('telefone'),
        email: formData.get('email'),
        senha: formData.get('senha'),
        endereco: {
            cep: formData.get('cep'),
            estado: formData.get('estado'),
            cidade: formData.get('cidade'),
            bairro: formData.get('bairro'),
            rua: formData.get('rua'),
            numero: formData.get('numero'),
            complemento: formData.get('complemento') || ''
        },
        aceitarNewsletter: formData.get('aceitarNewsletter') === 'on',
        dataCadastro: new Date().toISOString(),
        ativo: true
    };
    
    // Salvar usuário
    salvarUsuario(usuario);
    
    // Adicionar campos ocultos para Formspree (para melhor formatação do email)
    adicionarCamposFormspree(form, usuario);
    
    // Enviar formulário para Formspree (usando submit nativo)
    // Criar um formulário temporário para enviar para Formspree sem redirecionar
    enviarParaFormspree(usuario);
    
    // Mostrar sucesso
    showNotification('Cadastro realizado com sucesso!', 'success');
    
    // Limpar formulário
    form.reset();
    
    // Redirecionar após 2 segundos
    setTimeout(() => {
        window.location.href = 'perfil.html';
    }, 2000);
}

function salvarUsuario(usuario) {
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    usuarios.push(usuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    // Definir usuário como logado
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('currentUserId', usuario.id.toString());
    localStorage.setItem('userEmail', usuario.email);
    localStorage.setItem('userName', usuario.nome);
    
    console.log('Usuário cadastrado:', usuario);
}

// ===== ENVIAR PARA FORMSPREE =====

function adicionarCamposFormspree(form, usuario) {
    // Adicionar campo oculto para assunto do email
    let subjectField = form.querySelector('input[name="_subject"]');
    if (!subjectField) {
        subjectField = document.createElement('input');
        subjectField.type = 'hidden';
        subjectField.name = '_subject';
        form.appendChild(subjectField);
    }
    subjectField.value = 'Novo Cadastro - Valeriano';
    
    // Adicionar campo oculto para formatação do email
    let messageField = form.querySelector('textarea[name="mensagem"]');
    if (!messageField) {
        messageField = document.createElement('textarea');
        messageField.type = 'hidden';
        messageField.name = 'mensagem';
        messageField.style.display = 'none';
        form.appendChild(messageField);
    }
    messageField.value = `Novo cadastro realizado na loja Valeriano.

Dados do cliente:
Nome: ${usuario.nome}
Email: ${usuario.email}
CPF: ${usuario.cpf}
Telefone: ${usuario.telefone}
Data de Nascimento: ${usuario.dataNascimento}

Endereço:
${usuario.endereco.rua}, ${usuario.endereco.numero}${usuario.endereco.complemento ? ' - ' + usuario.endereco.complemento : ''}
${usuario.endereco.bairro}, ${usuario.endereco.cidade} - ${usuario.endereco.estado}
CEP: ${usuario.endereco.cep}

Newsletter: ${usuario.aceitarNewsletter ? 'Sim' : 'Não'}
Data do Cadastro: ${new Date(usuario.dataCadastro).toLocaleString('pt-BR')}`;
}

async function enviarParaFormspree(usuario) {
    try {
        // Criar um formulário temporário para enviar via fetch (sem redirecionar)
        const formData = new FormData();
        
        // Adicionar todos os campos do formulário
        formData.append('_subject', 'Novo Cadastro - Valeriano');
        formData.append('nome', usuario.nome);
        formData.append('email', usuario.email);
        formData.append('cpf', usuario.cpf);
        formData.append('telefone', usuario.telefone);
        formData.append('dataNascimento', usuario.dataNascimento);
        formData.append('rua', usuario.endereco.rua);
        formData.append('numero', usuario.endereco.numero);
        formData.append('complemento', usuario.endereco.complemento || '');
        formData.append('bairro', usuario.endereco.bairro);
        formData.append('cidade', usuario.endereco.cidade);
        formData.append('estado', usuario.endereco.estado);
        formData.append('cep', usuario.endereco.cep);
        formData.append('newsletter', usuario.aceitarNewsletter ? 'Sim' : 'Não');
        formData.append('dataCadastro', new Date(usuario.dataCadastro).toLocaleString('pt-BR'));
        formData.append('mensagem', `Novo cadastro realizado na loja Valeriano.

Dados do cliente:
Nome: ${usuario.nome}
Email: ${usuario.email}
CPF: ${usuario.cpf}
Telefone: ${usuario.telefone}
Data de Nascimento: ${usuario.dataNascimento}

Endereço:
${usuario.endereco.rua}, ${usuario.endereco.numero}${usuario.endereco.complemento ? ' - ' + usuario.endereco.complemento : ''}
${usuario.endereco.bairro}, ${usuario.endereco.cidade} - ${usuario.endereco.estado}
CEP: ${usuario.endereco.cep}

Newsletter: ${usuario.aceitarNewsletter ? 'Sim' : 'Não'}
Data do Cadastro: ${new Date(usuario.dataCadastro).toLocaleString('pt-BR')}`);
        
        // Enviar para Formspree
        const response = await fetch('https://formspree.io/f/xyzlrgve', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('Email enviado com sucesso para Formspree');
        } else {
            console.error('Erro ao enviar email para Formspree:', response.status);
        }
    } catch (error) {
        console.error('Erro ao enviar email via Formspree:', error);
        // Não mostrar erro para o usuário, pois o cadastro já foi realizado
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
    
    showNotification('Logout realizado com sucesso', 'info');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}
