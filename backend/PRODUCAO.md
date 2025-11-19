# 🚀 Configuração para Produção

Este documento explica como configurar o servidor para processar pagamentos **REAIS** no Mercado Pago.

## ⚠️ ATENÇÃO

**Em modo PRODUÇÃO, todos os pagamentos serão REAIS e cobrados dos clientes!**

Certifique-se de:
- ✅ Ter uma conta Mercado Pago aprovada para receber pagamentos
- ✅ Usar credenciais de PRODUÇÃO (não de teste)
- ✅ Ter testado tudo em modo SANDBOX antes
- ✅ Ter um domínio/URL de produção configurado

## 📋 Passo a Passo

### 1. Obter Credenciais de Produção

1. Acesse: **https://www.mercadopago.com.br/developers/panel**
2. Faça login na sua conta Mercado Pago
3. Selecione sua aplicação ou crie uma nova
4. Vá em **"Credenciais de produção"**
5. Copie:
   - **Access Token** (deve começar com `APP_USR-`)
   - **Public Key** (deve começar com `APP_USR-`)

### 2. Configurar arquivo .env

Edite o arquivo `backend/.env`:

```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-sua_access_token_de_producao
MERCADOPAGO_PUBLIC_KEY=APP_USR-sua_public_key_de_producao
MERCADOPAGO_MODE=production
PORT=3000
FRONTEND_URL=https://seu-dominio.com
PRODUCTION_URL=https://seu-dominio.com
JWT_SECRET=sua_chave_secreta_super_segura_aqui
```

**Importante:**
- Use credenciais que começam com `APP_USR-` (não `TEST-`)
- Configure `MERCADOPAGO_MODE=production`
- Configure `FRONTEND_URL` e `PRODUCTION_URL` com sua URL de produção

### 3. Verificar Configuração

O servidor irá validar automaticamente:
- ✅ Se as credenciais estão configuradas
- ✅ Se está usando credenciais de produção (não de teste)
- ✅ Se o modo está correto

Se houver erro, o servidor não iniciará e mostrará mensagens de erro.

### 4. Iniciar Servidor

```bash
cd backend
npm start
```

Ou use o script:
```bash
./start.sh
```

### 5. Verificar se está em Produção

Ao iniciar, você verá:
```
✅ Modo PRODUÇÃO - Processando pagamentos REAIS!
🚀 Servidor iniciado!
⚠️  ATENÇÃO: Servidor em modo PRODUÇÃO
   Todos os pagamentos serão REAIS e cobrados!
```

## 🔒 Segurança

### Validações Implementadas

1. **Validação de Credenciais**: O servidor verifica se está usando credenciais de produção
2. **CORS**: Configurado para aceitar apenas origens permitidas em produção
3. **Rate Limiting**: Limite de requisições para prevenir abuso
4. **Helmet**: Headers de segurança HTTP configurados
5. **Logs**: Logs específicos para pagamentos reais

### Recomendações

- ✅ Use HTTPS em produção
- ✅ Mantenha as credenciais seguras (não commite o .env)
- ✅ Configure webhooks do Mercado Pago para receber notificações
- ✅ Monitore os logs regularmente
- ✅ Tenha um backup do banco de dados (quando implementar)

## 📊 Logs de Produção

Em produção, você verá logs como:
```
💰 PAGAMENTO REAL processado - ID: 123456789, Status: approved, Valor: R$ 299,90
⚠️  PAGAMENTO REAL RECUSADO - ID: 987654321, Motivo: insufficient_amount
```

## 🔄 Voltar para Teste

Se precisar voltar para modo de teste:

1. Edite `backend/.env`:
   ```env
   MERCADOPAGO_MODE=sandbox
   MERCADOPAGO_ACCESS_TOKEN=TEST-sua_access_token_de_teste
   MERCADOPAGO_PUBLIC_KEY=TEST-sua_public_key_de_teste
   ```

2. Ou use o script:
   ```bash
   ./switch-to-test.sh
   ```

## 🆘 Problemas Comuns

### Erro: "Credenciais de teste não podem ser usadas em produção"
- **Solução**: Use credenciais que começam com `APP_USR-`

### Erro: "Não permitido por CORS"
- **Solução**: Configure `FRONTEND_URL` e `PRODUCTION_URL` no .env com sua URL de produção

### Pagamentos não estão sendo processados
- Verifique se as credenciais estão corretas
- Verifique os logs do servidor
- Verifique se a conta Mercado Pago está ativa e aprovada

## 📞 Suporte

Para problemas com o Mercado Pago:
- Documentação: https://www.mercadopago.com.br/developers/pt/docs
- Suporte: https://www.mercadopago.com.br/developers/pt/support

