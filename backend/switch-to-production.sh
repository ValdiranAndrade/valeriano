#!/bin/bash

# Script para mudar para modo de produção
echo "🚀 Mudando para modo de PRODUÇÃO..."
echo ""

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    exit 1
fi

# Fazer backup do .env atual
cp .env .env.backup
echo "✅ Backup criado: .env.backup"
echo ""

echo "⚠️  ATENÇÃO: Modo de PRODUÇÃO processa pagamentos REAIS!"
echo ""

# Atualizar MODE para production
sed -i.bak 's/MERCADOPAGO_MODE=sandbox/MERCADOPAGO_MODE=production/g' .env 2>/dev/null || \
sed -i '' 's/MERCADOPAGO_MODE=sandbox/MERCADOPAGO_MODE=production/g' .env 2>/dev/null

if grep -q "MERCADOPAGO_MODE=production" .env; then
    echo "✅ MERCADOPAGO_MODE mudado para production"
else
    # Se não existir, adicionar
    if ! grep -q "MERCADOPAGO_MODE" .env; then
        echo "MERCADOPAGO_MODE=production" >> .env
        echo "✅ MERCADOPAGO_MODE=production adicionado"
    fi
fi

echo ""
echo "⚠️  Lembre-se de usar credenciais de PRODUÇÃO (APP_USR-...)"
echo ""

