#!/bin/bash

echo "================================================"
echo "  Plano de Leitura Bíblica - Sistema Multi-Usuário"
echo "================================================"
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    echo "Por favor, instale Node.js: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Verificar se dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Instalando dependências..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Erro ao instalar dependências"
        exit 1
    fi
fi

# Verificar se banco de dados existe
if [ ! -f "biblia.db" ]; then
    echo ""
    echo "🗄️  Criando banco de dados..."
    npm run init-db
    if [ $? -ne 0 ]; then
        echo "❌ Erro ao criar banco de dados"
        exit 1
    fi
    echo ""
    echo "════════════════════════════════════════"
    echo "  CREDENCIAIS DE ACESSO"
    echo "════════════════════════════════════════"
    echo "  Usuário: admin"
    echo "  Senha:   admin123"
    echo "════════════════════════════════════════"
    echo "⚠️  Troque a senha após o primeiro login!"
    echo ""
fi

echo ""
echo "🚀 Iniciando servidor..."
echo ""

# Iniciar servidor
npm start
