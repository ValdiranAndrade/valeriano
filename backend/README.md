# 🚀 Backend - Loja de Roupas

Backend para processamento de pagamentos com integração ao Mercado Pago.

## 📋 Pré-requisitos

- Node.js 16+ instalado
- Conta no Mercado Pago (https://www.mercadopago.com.br/)
- Credenciais do Mercado Pago (Access Token)

## 🔧 Instalação

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env
```

3. **Editar arquivo `.env`** com suas credenciais:
```env
MERCADOPAGO_ACCESS_TOKEN=seu_token_aqui
MERCADOPAGO_PUBLIC_KEY=sua_public_key_aqui
MERCADOPAGO_MODE=sandbox  # ou 'production'
PORT=3000
FRONTEND_URL=http://localhost:5500
```

## 🔑 Obter Credenciais do Mercado Pago

### Modo Sandbox (Teste):
1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Crie uma aplicação
3. Copie o **Access Token** de teste
4. Copie a **Public Key** de teste

### Modo Produção:
1. Acesse: https://www.mercadopago.com.br/developers/panel/credentials
2. Copie o **Access Token** de produção
3. Copie a **Public Key** de produção

## 🚀 Executar

### Modo Desenvolvimento (com auto-reload):
```bash
npm run dev
```

### Modo Produção:
```bash
npm start
```

O servidor estará rodando em: `http://localhost:3000`

## 📡 Endpoints da API

### `POST /api/payment/create-preference`
Cria uma preferência de pagamento para checkout redirect.

**Body:**
```json
{
  "items": [
    {
      "nome": "Camiseta",
      "quantidade": 2,
      "preco": 99.90
    }
  ],
  "total": 199.80,
  "customer": {
    "fullName": "João Silva",
    "email": "joao@email.com",
    "cpf": "12345678900",
    "phone": "(11) 99999-9999"
  },
  "address": {
    "cep": "01234-567",
    "rua": "Rua das Flores",
    "numero": "123",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "estado": "SP"
  },
  "installments": 12
}
```

**Response:**
```json
{
  "success": true,
  "preferenceId": "123456789",
  "initPoint": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=...",
  "sandboxInitPoint": "https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=...",
  "orderId": "order_1234567890"
}
```

### `POST /api/payment/process`
Processa pagamento direto com cartão de crédito.

**Body:**
```json
{
  "orderData": {
    "items": [...],
    "total": 199.80,
    "customer": {...},
    "address": {...}
  },
  "paymentData": {
    "token": "token_do_mercado_pago",
    "payment_method_id": "visa",
    "installments": 3,
    "issuer_id": 123
  }
}
```

**Response:**
```json
{
  "success": true,
  "paymentId": "123456789",
  "status": "approved",
  "statusDetail": "accredited",
  "orderId": "order_1234567890",
  "message": "Pagamento aprovado!"
}
```

### `POST /api/payment/webhook`
Webhook para receber notificações do Mercado Pago.

### `GET /api/payment/status/:orderId`
Consulta o status de um pedido.

### `GET /health`
Health check do servidor.

## 🔒 Segurança

- ✅ Helmet configurado para segurança HTTP
- ✅ Rate limiting para prevenir abuso
- ✅ CORS configurado
- ✅ Validação de dados
- ✅ HTTPS recomendado em produção

## 🧪 Testes

### Cartões de teste (Sandbox):
- **Visa aprovado:** 4509 9535 6623 3704
- **Mastercard aprovado:** 5031 7557 3453 0604
- **CVV:** 123
- **Data:** Qualquer data futura
- **Nome:** Qualquer nome

## 📝 Notas

- Em produção, substitua o armazenamento em memória por banco de dados
- Configure webhook URL no painel do Mercado Pago
- Use HTTPS em produção
- Configure variáveis de ambiente adequadamente

## 🐛 Troubleshooting

### Erro: "Invalid access_token"
- Verifique se o token está correto no `.env`
- Certifique-se de usar o token do ambiente correto (sandbox/production)

### Erro: CORS
- Verifique `FRONTEND_URL` no `.env`
- Confirme que o frontend está na mesma origem configurada

### Erro: "Payment not found"
- Certifique-se de estar usando o modo correto (sandbox/production)
- Verifique se o payment ID existe no ambiente correto

