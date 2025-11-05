#!/bin/bash

# Script para mudar para modo de teste (sandbox)
echo "🔧 Mudando para modo de TESTE (Sandbox)..."
echo ""

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "💡 Copiando config.example.env para .env..."
    cp config.example.env .env
fi

# Fazer backup do .env atual
cp .env .env.backup
echo "✅ Backup criado: .env.backup"
echo ""

echo "⚠️  IMPORTANTE: Para usar modo de teste, você precisa:"
echo ""
echo "1. Acessar: https://www.mercadopago.com.br/developers/panel"
echo "2. Ir em 'Credenciais de teste'"
echo "3. Copiar Access Token (TEST-...) e Public Key (TEST-...)"
echo ""
echo "4. Editar o arquivo .env e substituir:"
echo "   MERCADOPAGO_ACCESS_TOKEN=TEST-sua_access_token_de_teste"
echo "   MERCADOPAGO_PUBLIC_KEY=TEST-sua_public_key_de_teste"
echo "   MERCADOPAGO_MODE=sandbox"
echo ""
echo "5. Reiniciar o backend: npm run dev"
echo ""

# Atualizar MODE para sandbox
sed -i.bak 's/MERCADOPAGO_MODE=production/MERCADOPAGO_MODE=sandbox/g' .env 2>/dev/null || \
sed -i '' 's/MERCADOPAGO_MODE=production/MERCADOPAGO_MODE=sandbox/g' .env 2>/dev/null

if grep -q "MERCADOPAGO_MODE=sandbox" .env; then
    echo "✅ MERCADOPAGO_MODE mudado para sandbox"
else
    # Se não existir, adicionar
    if ! grep -q "MERCADOPAGO_MODE" .env; then
        echo "MERCADOPAGO_MODE=sandbox" >> .env
        echo "✅ MERCADOPAGO_MODE=sandbox adicionado"
    fi
fi

echo ""
echo "📋 Cartões de teste do Mercado Pago:"
echo ""
echo "✅ Aprovado:"
echo "   5031 4332 1540 6351 (CVV: 123, Validade: 11/25)"
echo "   4509 9535 6623 3704 (CVV: 123, Validade: 11/25)"
echo ""
echo "📖 Veja TESTES_PAGAMENTO.md para mais informações"
echo ""

