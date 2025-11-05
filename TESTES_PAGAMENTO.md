# 🧪 Guia Completo - Testes de Pagamento com Mercado Pago

## 📋 O que é necessário para testes

Para testar pagamentos com cartões de teste do Mercado Pago, você precisa:

1. ✅ **Credenciais de TESTE** (não de produção)
2. ✅ **Modo SANDBOX** ativado
3. ✅ **Cartões de teste** específicos
4. ✅ **Contas de teste** (vendedor e comprador)

---

## 🔑 Passo 1: Obter Credenciais de Teste

### 1.1 Acessar Painel do Desenvolvedor

1. Acesse: **https://www.mercadopago.com.br/developers/panel**
2. Faça login na sua conta
3. Selecione sua aplicação (ou crie uma nova)

### 1.2 Obter Credenciais de Teste

1. No menu lateral, clique em **"Credenciais de teste"**
2. Copie:
   - **Access Token** (começa com `TEST-`)
   - **Public Key** (começa com `TEST-`)

⚠️ **IMPORTANTE:** Use credenciais que começam com `TEST-`, não `APP_USR-`!

---

## ⚙️ Passo 2: Configurar Backend para Testes

### 2.1 Editar arquivo `.env`

Abra o arquivo `backend/.env` e configure:

```env
# Modo SANDBOX (teste)
MERCADOPAGO_MODE=sandbox
MERCADOPAGO_ACCESS_TOKEN=TEST-seu_access_token_de_teste_aqui
MERCADOPAGO_PUBLIC_KEY=TEST-sua_public_key_de_teste_aqui
PORT=3000
FRONTEND_URL=http://localhost:5500
```

### 2.2 Diferenças entre Produção e Teste

| Item | Produção | Teste (Sandbox) |
|------|----------|-----------------|
| Access Token | `APP_USR-...` | `TEST-...` |
| Public Key | `APP_USR-...` | `TEST-...` |
| MODE | `production` | `sandbox` |
| Dinheiro | Real | Simulado |

---

## 💳 Passo 3: Cartões de Teste do Mercado Pago

### Cartões de Crédito Aprovados

| Número | CVV | Validade | Nome | Status |
|--------|-----|----------|------|--------|
| `5031 4332 1540 6351` | `123` | `11/25` | Qualquer | ✅ Aprovado |
| `5031 7557 3453 0604` | `123` | `11/25` | Qualquer | ✅ Aprovado |
| `4509 9535 6623 3704` | `123` | `11/25` | Qualquer | ✅ Aprovado |
| `4013 5406 8274 6260` | `123` | `11/25` | Qualquer | ✅ Aprovado |

### Cartões de Débito

| Número | CVV | Validade | Nome |
|--------|-----|----------|------|
| `5031 4332 1540 6351` | `123` | `11/25` | Qualquer |

### Cartões para Testar Recusas

| Número | CVV | Validade | Resultado |
|--------|-----|----------|-----------|
| `5031 4332 1540 6351` | `123` | `11/25` | Recusado (insuficiente) |
| `5031 4332 1540 6351` | `123` | `11/25` | Recusado (cartão inválido) |

### Cartões para Testar Pendências

| Número | CVV | Validade | Resultado |
|--------|-----|----------|-----------|
| `5031 4332 1540 6351` | `123` | `11/25` | Pendente |

### Dados Comuns para Todos os Cartões

- **CVV:** `123`
- **Validade:** Qualquer data futura (ex: `11/25`, `12/26`)
- **Nome:** Qualquer nome
- **CPF:** Qualquer CPF válido (ex: `12345678900`)

---

## 🧪 Passo 4: Como Testar

### 4.1 Testar Pagamento com Cartão

1. **Certifique-se que o backend está em modo sandbox:**
   ```bash
   cd backend
   npm run dev
   ```
   Deve mostrar: `🔧 Modo SANDBOX (Teste) ativado`

2. **Abra `pagamento.html` no navegador**

3. **Preencha o formulário:**
   - Endereço de entrega
   - Informações de contato
   - Selecione "Cartão de Crédito"

4. **Use um cartão de teste:**
   - Número: `5031 4332 1540 6351`
   - CVV: `123`
   - Validade: `11/25`
   - Nome: Qualquer nome

5. **Clique em "Finalizar Compra"**

6. **Verifique o resultado:**
   - ✅ Pagamento deve ser aprovado
   - ✅ Não há movimentação real de dinheiro
   - ✅ Logs no backend mostram status "approved"

### 4.2 Testar PIX

1. Selecione "PIX" como forma de pagamento
2. Será redirecionado para checkout do Mercado Pago (sandbox)
3. No modo sandbox, o PIX será simulado

### 4.3 Testar Boleto

1. Selecione "Boleto" como forma de pagamento
2. Será redirecionado para checkout do Mercado Pago (sandbox)
3. No modo sandbox, o boleto será simulado

---

## 📊 Verificar Status do Modo

### Backend

No terminal do backend, você deve ver:

```
🔧 Modo SANDBOX (Teste) ativado
```

Se aparecer `🚀 Modo PRODUÇÃO ativado`, você está usando credenciais de produção!

### Health Check

```bash
curl http://localhost:3000/health
```

Deve retornar:
```json
{
  "status": "OK",
  "environment": "sandbox"
}
```

---

## ⚠️ Importante

### NUNCA use cartões de teste em produção!

- Credenciais de teste (`TEST-`) só funcionam em modo `sandbox`
- Credenciais de produção (`APP_USR-`) só funcionam em modo `production`
- Não misture credenciais de teste e produção

### Segurança

- Cartões de teste são apenas para desenvolvimento
- Não use dados de cartões reais em testes
- Em produção, use apenas credenciais reais

---

## 🔍 Troubleshooting

### Erro: "bin_not_found"

**Causa:** Tentando usar cartão de teste em modo produção, ou cartão inválido.

**Solução:**
1. Verifique que `MERCADOPAGO_MODE=sandbox` no `.env`
2. Use apenas cartões de teste listados acima
3. Reinicie o backend após mudar `.env`

### Erro: "Invalid credentials"

**Causa:** Credenciais de teste inválidas ou expiradas.

**Solução:**
1. Verifique que as credenciais começam com `TEST-`
2. Obtenha novas credenciais no painel do desenvolvedor
3. Verifique que não há espaços extras no `.env`

### Pagamento não é aprovado

**Causa:** Usando cartão de teste incorreto ou credenciais de produção.

**Solução:**
1. Use exatamente os números de cartão listados acima
2. Verifique que está em modo sandbox
3. Verifique os logs do backend para detalhes

---

## 📚 Referências

- **Documentação Mercado Pago:** https://www.mercadopago.com.br/developers/pt/docs
- **Painel do Desenvolvedor:** https://www.mercadopago.com.br/developers/panel
- **Cartões de Teste:** https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test/test-cards

---

## ✅ Checklist de Configuração

- [ ] Credenciais de teste obtidas (`TEST-...`)
- [ ] Arquivo `.env` configurado com `MERCADOPAGO_MODE=sandbox`
- [ ] Access Token de teste configurado
- [ ] Public Key de teste configurada
- [ ] Backend reiniciado após mudanças
- [ ] Backend mostra "Modo SANDBOX"
- [ ] Cartões de teste anotados
- [ ] Pronto para testar!

---

**Agora você está pronto para testar pagamentos sem risco! 🎉**

