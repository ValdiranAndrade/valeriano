# 🚀 Backend de Pagamento - Guia Rápido

## ⚡ Início Rápido (5 minutos)

### 1. Instalar Dependências
```bash
cd backend
npm install
```

### 2. Configurar Credenciais
```bash
# Copiar arquivo de exemplo
cp config.example.env .env

# Editar .env e adicionar suas credenciais do Mercado Pago
```

### 3. Iniciar Servidor
```bash
npm run dev
```

✅ **Pronto!** O backend estará rodando em `http://localhost:3000`

---

## 📝 Configuração Mínima (.env)

```env
MERCADOPAGO_ACCESS_TOKEN=TEST-seu_token_aqui
MERCADOPAGO_PUBLIC_KEY=TEST-sua_public_key_aqui
MERCADOPAGO_MODE=sandbox
PORT=3000
FRONTEND_URL=http://localhost:5500
```

---

## 🔑 Obter Credenciais

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Crie uma aplicação
3. Copie **Access Token** e **Public Key** (modo teste)

---

## 🧪 Testar

### Health Check:
```bash
curl http://localhost:3000/health
```

### Cartão de Teste:
```
Número: 4509 9535 6623 3704
CVV: 123
Validade: 11/25
```

---

## 📚 Documentação Completa

Veja `INSTALACAO.md` para guia completo.

---

## 🔒 Segurança Implementada

- ✅ Helmet (segurança HTTP)
- ✅ Rate Limiting
- ✅ CORS configurado
- ✅ Validação de dados
- ✅ Tokenização de cartão (PCI DSS compliant)

---

## 🐛 Problemas Comuns

**Erro ao iniciar:**
- Verifique se Node.js está instalado
- Verifique se todas as dependências foram instaladas

**Erro de conexão no frontend:**
- Certifique-se que o backend está rodando
- Verifique `FRONTEND_URL` no `.env`
- Verifique CORS

**Token inválido:**
- Use credenciais corretas (sandbox/production)
- Verifique se copiou o token completo

---

**Pronto para começar!** 🎉

