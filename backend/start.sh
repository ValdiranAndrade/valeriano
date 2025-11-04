#!/bin/bash

# Script de inicialização do backend

echo "🚀 Iniciando Backend..."
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 16+ primeiro."
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ NPM não encontrado. Instale NPM primeiro."
    exit 1
fi

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "⚠️  Arquivo .env não encontrado!"
    echo "📋 Copiando arquivo de exemplo..."
    cp config.example.env .env
    echo "✅ Arquivo .env criado. Configure suas credenciais antes de continuar!"
    echo ""
    echo "📝 Edite o arquivo .env e adicione:"
    echo "   - MERCADOPAGO_ACCESS_TOKEN"
    echo "   - MERCADOPAGO_PUBLIC_KEY"
    echo ""
    read -p "Pressione Enter após configurar o .env..."
fi

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    echo ""
fi

# Verificar variáveis de ambiente essenciais
source .env 2>/dev/null || true

if [ -z "$MERCADOPAGO_ACCESS_TOKEN" ]; then
    echo "⚠️  MERCADOPAGO_ACCESS_TOKEN não configurado no .env"
    echo "   Configure antes de iniciar!"
    exit 1
fi

if [ -z "$MERCADOPAGO_PUBLIC_KEY" ]; then
    echo "⚠️  MERCADOPAGO_PUBLIC_KEY não configurado no .env"
    echo "   Configure antes de iniciar!"
    exit 1
fi

# Iniciar servidor
echo "✅ Tudo configurado!"
echo "🌐 Iniciando servidor na porta ${PORT:-3000}..."
echo ""

if [ "$1" = "dev" ] || [ "$1" = "development" ]; then
    npm run dev
else
    npm start
fi

