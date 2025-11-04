# ⚙️ Configuração Rápida

## ✅ Passo 1: Arquivo .env Criado!

O arquivo `.env` já foi criado. Agora você precisa adicionar suas credenciais do Mercado Pago.

## 🔑 Passo 2: Obter Credenciais do Mercado Pago

### Para Testes (Sandbox):

1. Acesse: **https://www.mercadopago.com.br/developers/panel**
2. Faça login na sua conta
3. Clique em **"Criar aplicação"** (se ainda não tiver)
4. Vá em **"Credenciais de teste"**
5. Copie:
   - **Access Token** (começa com TEST-)
   - **Public Key** (começa com TEST-)

### Sem Conta? Crie Grátis:
- Acesse: https://www.mercadopago.com.br/
- Clique em "Cadastre-se"
- Complete o cadastro (grátis)

## 📝 Passo 3: Editar arquivo .env

Abra o arquivo `backend/.env` e substitua:

```env
MERCADOPAGO_ACCESS_TOKEN=TEST-sua_access_token_real_aqui
MERCADOPAGO_PUBLIC_KEY=TEST-sua_public_key_real_aqui
MERCADOPAGO_MODE=sandbox
PORT=3000
FRONTEND_URL=http://localhost:5500
```

⚠️ **IMPORTANTE:** Substitua os valores de exemplo pelas credenciais reais!

## 🚀 Passo 4: Iniciar o Backend

Depois de configurar o `.env`, execute:

```bash
npm run dev
```

Ou use o script:
```bash
./start.sh
```

## ✅ Verificar se Funcionou

Abra no navegador: http://localhost:3000/health

Deve mostrar:
```json
{
  "status": "OK",
  "timestamp": "...",
  "environment": "sandbox"
}
```

## 🧪 Testar Pagamento

1. Abra `pagamento.html` no navegador
2. Preencha o formulário
3. Use cartão de teste: **4509 9535 6623 3704** (CVV: 123)

---

**Precisa de ajuda?** Veja `INSTALACAO.md` para guia completo!

