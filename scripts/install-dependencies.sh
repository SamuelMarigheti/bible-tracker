#!/bin/bash

# Script de Instalação Automática de Dependências
# Sistema: Fedora/RHEL

set -e

echo "================================================"
echo "  Instalação Automática - Plano Leitura Bíblica"
echo "================================================"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se é Fedora/RHEL
if [ ! -f /etc/fedora-release ] && [ ! -f /etc/redhat-release ]; then
    echo -e "${YELLOW}⚠️  Este script foi feito para Fedora/RHEL${NC}"
    echo "Para Ubuntu/Debian, use: sudo apt-get install build-essential"
    read -p "Deseja continuar mesmo assim? (s/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

echo "🔍 Verificando ferramentas instaladas..."
echo ""

# Verificar Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js ${NODE_VERSION} encontrado${NC}"
else
    echo -e "${RED}❌ Node.js não encontrado${NC}"
    echo "Instale Node.js primeiro: https://nodejs.org"
    exit 1
fi

# Verificar npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✅ npm ${NPM_VERSION} encontrado${NC}"
else
    echo -e "${RED}❌ npm não encontrado${NC}"
    exit 1
fi

# Verificar Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✅ ${PYTHON_VERSION} encontrado${NC}"
else
    echo -e "${RED}❌ Python 3 não encontrado${NC}"
    echo "Será instalado junto com as ferramentas de compilação"
fi

# Verificar g++
if command -v g++ &> /dev/null; then
    GCC_VERSION=$(g++ --version | head -n1)
    echo -e "${GREEN}✅ ${GCC_VERSION} encontrado${NC}"
    GCC_INSTALLED=true
else
    echo -e "${RED}❌ g++ não encontrado${NC}"
    GCC_INSTALLED=false
fi

# Verificar make
if command -v make &> /dev/null; then
    MAKE_VERSION=$(make --version | head -n1)
    echo -e "${GREEN}✅ ${MAKE_VERSION} encontrado${NC}"
    MAKE_INSTALLED=true
else
    echo -e "${RED}❌ make não encontrado${NC}"
    MAKE_INSTALLED=false
fi

echo ""

# Instalar ferramentas se necessário
if [ "$GCC_INSTALLED" = false ] || [ "$MAKE_INSTALLED" = false ]; then
    echo "📦 Instalando ferramentas de compilação..."
    echo ""
    echo "Será executado: sudo dnf install -y gcc-c++ make python3"
    echo ""
    read -p "Continuar com a instalação? (S/n) " -n 1 -r
    echo

    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        sudo dnf install -y gcc-c++ make python3

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Ferramentas instaladas com sucesso!${NC}"
        else
            echo -e "${RED}❌ Erro ao instalar ferramentas${NC}"
            exit 1
        fi
    else
        echo "Instalação cancelada pelo usuário"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Todas as ferramentas já estão instaladas!${NC}"
fi

echo ""
echo "================================================"
echo "  Instalando Dependências do Projeto"
echo "================================================"
echo ""

# Limpar instalação anterior se existir
if [ -d "node_modules" ]; then
    echo "🧹 Limpando instalação anterior..."
    rm -rf node_modules package-lock.json
fi

# Instalar dependências
echo "📦 Executando npm install..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Dependências instaladas com sucesso!${NC}"
else
    echo ""
    echo -e "${RED}❌ Erro ao instalar dependências${NC}"
    exit 1
fi

echo ""
echo "================================================"
echo "  Inicializando Banco de Dados"
echo "================================================"
echo ""

# Verificar se banco já existe
if [ -f "biblia.db" ]; then
    echo -e "${YELLOW}⚠️  Banco de dados já existe (biblia.db)${NC}"
    read -p "Deseja recriar? Isso apagará todos os dados! (s/N) " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Ss]$ ]]; then
        rm biblia.db
        npm run init-db
    else
        echo "Mantendo banco de dados existente"
    fi
else
    npm run init-db
fi

echo ""
echo "================================================"
echo "  ✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
echo "================================================"
echo ""
echo "Para iniciar o servidor, execute:"
echo ""
echo "  npm start"
echo ""
echo "Ou use o script de início rápido:"
echo ""
echo "  ./scripts/start.sh"
echo ""
echo "Acesse: http://localhost:3000"
echo ""
echo "Login:"
echo "  Usuário: admin"
echo "  Senha: Cristomesalvou@123##"
echo ""
echo "================================================"
