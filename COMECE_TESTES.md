# 🚀 Comece os Testes Agora - Guia Rápido

## ⚠️ Situação Atual

Você está usando **credenciais de PRODUÇÃO** (`APP_USR-...`) em modo `production`.

**Para fazer testes, você precisa de credenciais de TESTE (`TEST-...`).**

---

## ✅ Passo a Passo Rápido

### 1️⃣ Obter Credenciais de Teste

1. Acesse: **https://www.mercadopago.com.br/developers/panel**
2. Faça login
3. Selecione sua aplicação
4. Clique em **"Credenciais de teste"** (menu lateral)
5. Copie:
   - **Access Token** (começa com `TEST-`)
   - **Public Key** (começa com `TEST-`)

### 2️⃣ Configurar Backend

**Opção A: Usando Script (Recomendado)**

```bash
cd backend
./switch-to-test.sh
```

O script vai:
- Fazer backup do `.env` atual
- Mudar `MERCADOPAGO_MODE` para `sandbox`
- Mostrar instruções

**Opção B: Manual**

1. Abra `backend/.env`
2. Substitua as credenciais:

```env
MERCADOPAGO_ACCESS_TOKEN=TEST-sua_access_token_de_teste_aqui
MERCADOPAGO_PUBLIC_KEY=TEST-sua_public_key_de_teste_aqui
MERCADOPAGO_MODE=sandbox
```

3. Salve o arquivo

### 3️⃣ Reiniciar Backend

```bash
cd backend
npm run dev
```

**Deve mostrar:** `🔧 Modo SANDBOX (Teste) ativado`

### 4️⃣ Testar Pagamento

1. Abra `pagamento.html`
2. Preencha o formulário
3. Use cartão de teste:
   - **Número:** `5031 4332 1540 6351`
   - **CVV:** `123`
   - **Validade:** `11/25`
   - **Nome:** Qualquer nome
4. Clique em "Finalizar Compra"
5. ✅ Pagamento deve ser aprovado!

---

## 💳 Cartões de Teste do Mercado Pago

### Cartão Aprovado (Recomendado)

```
Número: 5031 4332 1540 6351
CVV: 123
Validade: 11/25 (qualquer data futura)
Nome: Qualquer nome
```

### Outros Cartões de Teste

| Número | CVV | Validade | Status |
|--------|-----|----------|--------|
| `4509 9535 6623 3704` | `123` | `11/25` | ✅ Aprovado |
| `5031 7557 3453 0604` | `123` | `11/25` | ✅ Aprovado |
| `4013 5406 8274 6260` | `123` | `11/25` | ✅ Aprovado |

---

## 🔍 Verificar se Está Funcionando

### Backend mostra modo sandbox?

```bash
# No terminal do backend, deve aparecer:
🔧 Modo SANDBOX (Teste) ativado
```

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

## ⚠️ Diferenças Importantes

| Item | Produção | Teste (Sandbox) |
|------|----------|-----------------|
| Access Token | `APP_USR-...` | `TEST-...` |
| Public Key | `APP_USR-...` | `TEST-...` |
| MODE | `production` | `sandbox` |
| Dinheiro | 💰 Real | 🎮 Simulado |
| Cartões | Cartões reais | Cartões de teste |

---

## 🎯 Resultado Esperado

Quando configurado corretamente:

1. ✅ Backend mostra: `🔧 Modo SANDBOX (Teste) ativado`
2. ✅ Health check retorna: `"environment": "sandbox"`
3. ✅ Pagamento com cartão de teste é aprovado
4. ✅ **Nenhum dinheiro real é movimentado**
5. ✅ Logs mostram status de teste

---

## 📚 Documentação Completa

Para mais detalhes, veja:
- **TESTES_PAGAMENTO.md** - Guia completo
- **backend/README.md** - Documentação da API

---

## 🆘 Problemas Comuns

### Erro: "bin_not_found"

**Solução:** Você está usando cartão de teste em modo produção. Mude para sandbox!

### Backend não muda para sandbox

**Solução:** 
1. Verifique que o `.env` tem `MERCADOPAGO_MODE=sandbox`
2. Reinicie o backend completamente
3. Verifique os logs ao iniciar

### Credenciais de teste não funcionam

**Solução:**
1. Verifique que começam com `TEST-`
2. Obtenha novas credenciais no painel
3. Verifique que não há espaços extras no `.env`

---

**✅ Agora você está pronto para testar sem risco! 🎉**

