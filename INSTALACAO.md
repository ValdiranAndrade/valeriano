# 🚀 Guia de Instalação - Sistema de Pagamento Completo

Este guia explica como configurar o backend com Mercado Pago para processar pagamentos reais.

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Mercado Pago](#configuração-do-mercado-pago)
3. [Instalação do Backend](#instalação-do-backend)
4. [Configuração do Frontend](#configuração-do-frontend)
5. [Testando o Sistema](#testando-o-sistema)
6. [Produção](#produção)

---

## 📦 Pré-requisitos

- **Node.js 16+** instalado ([Download](https://nodejs.org/))
- **Conta no Mercado Pago** ([Criar conta](https://www.mercadopago.com.br/))
- **NPM** (vem com Node.js)

### Verificar instalação:
```bash
node --version  # Deve ser 16 ou superior
npm --version
```

---

## 🔑 Configuração do Mercado Pago

### Passo 1: Criar Conta no Mercado Pago

1. Acesse: https://www.mercadopago.com.br/
2. Clique em "Cadastre-se" ou "Criar conta"
3. Complete o cadastro

### Passo 2: Obter Credenciais

#### Para Testes (Sandbox):

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Clique em "Criar aplicação"
3. Preencha os dados da aplicação
4. Vá em "Credenciais de teste"
5. Copie:
   - **Access Token** (TEST-xxxxx-xxxxx)
   - **Public Key** (TEST-xxxxx-xxxxx)

#### Para Produção:

1. Acesse: https://www.mercadopago.com.br/developers/panel/credentials
2. Em "Credenciais de produção", copie:
   - **Access Token** (produção)
   - **Public Key** (produção)

⚠️ **IMPORTANTE:** Use credenciais de teste primeiro para não processar pagamentos reais!

---

## 💻 Instalação do Backend

### Passo 1: Instalar Dependências

```bash
cd backend
npm install
```

### Passo 2: Configurar Variáveis de Ambiente

1. Copie o arquivo de exemplo:
```bash
cp config.example.env .env
```

2. Edite o arquivo `.env` e preencha com suas credenciais:

```env
MERCADOPAGO_ACCESS_TOKEN=TEST-sua_access_token_aqui
MERCADOPAGO_PUBLIC_KEY=TEST-sua_public_key_aqui
MERCADOPAGO_MODE=sandbox
PORT=3000
FRONTEND_URL=http://localhost:5500
JWT_SECRET=sua_chave_secreta_super_segura_aqui
```

⚠️ **NÃO compartilhe** o arquivo `.env` - ele contém informações sensíveis!

### Passo 3: Iniciar o Servidor

#### Modo Desenvolvimento (com auto-reload):
```bash
npm run dev
```

#### Modo Produção:
```bash
npm start
```

O servidor estará rodando em: **http://localhost:3000**

### Verificar se está funcionando:

Abra no navegador: http://localhost:3000/health

Você deve ver:
```json
{
  "status": "OK",
  "timestamp": "...",
  "environment": "sandbox"
}
```

---

## 🌐 Configuração do Frontend

### Passo 1: Configurar Public Key (Opcional)

O frontend tentará obter a Public Key automaticamente do backend. Se preferir configurar manualmente:

1. Abra o console do navegador (F12)
2. Execute:
```javascript
localStorage.setItem('mercadopago_public_key', 'SUA_PUBLIC_KEY_AQUI');
```

### Passo 2: Verificar URL da API

No arquivo `pagamento.js`, verifique se a URL está correta:

```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

Se seu backend estiver em outra porta ou URL, altere aqui.

### Passo 3: Testar Conexão

1. Abra a página `pagamento.html` no navegador
2. Abra o console (F12)
3. Você deve ver: `Página de pagamento inicializada`

---

## 🧪 Testando o Sistema

### Cartões de Teste (Sandbox)

Use estes cartões para testar:

#### ✅ Cartão Aprovado - Visa:
```
Número: 4509 9535 6623 3704
CVV: 123
Validade: 11/25 (qualquer data futura)
Nome: Qualquer nome
```

#### ✅ Cartão Aprovado - Mastercard:
```
Número: 5031 7557 3453 0604
CVV: 123
Validade: 11/25
Nome: Qualquer nome
```

#### ❌ Cartão Recusado (para testar erros):
```
Número: 5031 4332 1540 6351
CVV: 123
Validade: 11/25
```

### Fluxo de Teste Completo:

1. **Inicie o backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Abra o frontend:**
   - Abra `index.html` ou `carrinho.html`
   - Adicione produtos ao carrinho
   - Vá para `pagamento.html`

3. **Preencha o formulário:**
   - Endereço de entrega (use CEP válido)
   - Escolha "Cartão de Crédito"
   - Use um cartão de teste acima
   - Clique em "Finalizar Pedido"

4. **Resultado esperado:**
   - Cartão tokenizado (não envia dados completos)
   - Requisição enviada para backend
   - Backend processa com Mercado Pago
   - Pagamento aprovado ou recusado
   - Redirecionamento para confirmação

---

## 🚀 Produção

### Checklist Antes de Produção:

- [ ] Usar credenciais de **PRODUÇÃO** do Mercado Pago
- [ ] Configurar `MERCADOPAGO_MODE=production` no `.env`
- [ ] Usar **HTTPS** obrigatório
- [ ] Configurar webhook URL no painel do Mercado Pago
- [ ] Substituir armazenamento em memória por banco de dados
- [ ] Implementar logs adequados
- [ ] Configurar monitoramento
- [ ] Testar todos os fluxos
- [ ] Revisar segurança

### Configurar Webhook:

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Vá em "Webhooks"
3. Adicione URL: `https://seudominio.com/api/payment/webhook`
4. Eventos: selecione "payment"

### Variáveis de Ambiente em Produção:

```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-sua_access_token_producao
MERCADOPAGO_PUBLIC_KEY=APP_USR-sua_public_key_producao
MERCADOPAGO_MODE=production
PORT=3000
FRONTEND_URL=https://seudominio.com
```

---

## 🐛 Solução de Problemas

### Erro: "SDK do Mercado Pago não carregado"
**Solução:** Verifique se o script está no HTML:
```html
<script src="https://sdk.mercadopago.com/js/v2"></script>
```

### Erro: "Public Key não configurada"
**Solução:** 
1. Configure no `.env` do backend
2. Ou configure manualmente: `localStorage.setItem('mercadopago_public_key', 'SUA_KEY')`

### Erro: "Erro de conexão"
**Solução:** 
1. Verifique se o backend está rodando: `http://localhost:3000/health`
2. Verifique CORS no backend
3. Verifique `FRONTEND_URL` no `.env`

### Erro: "Invalid access_token"
**Solução:**
1. Verifique se o token está correto no `.env`
2. Certifique-se de usar token do ambiente correto (sandbox/production)
3. Não use credenciais de teste em produção e vice-versa

### Erro: CORS
**Solução:**
1. Verifique `FRONTEND_URL` no `.env` do backend
2. Certifique-se que a URL do frontend corresponde exatamente

---

## 📞 Suporte

- **Documentação Mercado Pago:** https://www.mercadopago.com.br/developers/pt/docs
- **Suporte Mercado Pago:** https://www.mercadopago.com.br/developers/pt/support

---

## ✅ Verificação Final

Execute estes testes:

1. ✅ Backend inicia sem erros
2. ✅ Health check retorna OK
3. ✅ Frontend consegue buscar Public Key
4. ✅ Cartão de teste é tokenizado
5. ✅ Pagamento de teste é processado
6. ✅ Pedido é criado corretamente
7. ✅ Webhook recebe notificações (em produção)

---

**Pronto! Seu sistema de pagamento está configurado! 🎉**

