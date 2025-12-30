# 🚀 Início Rápido - Instalação Corrigida

## ❌ Problema Detectado

O `npm install` está **falhando** porque falta o compilador C++ (`g++`) no seu sistema Fedora.

```
Erro: make: g++: Arquivo ou diretório inexistente
```

## ✅ Solução Rápida (Escolha uma)

### Opção 1: Script Automático (Recomendado)

```bash
./scripts/install-dependencies.sh
```

Este script irá:
1. Verificar o que está instalado
2. Instalar `gcc-c++` e `make` automaticamente
3. Instalar dependências npm
4. Criar banco de dados
5. Deixar tudo pronto para uso

### Opção 2: Instalação Manual

```bash
# 1. Instalar ferramentas de compilação C++
sudo dnf install gcc-c++ make

# 2. Limpar e reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# 3. Criar banco de dados
npm run init-db

# 4. Iniciar servidor
npm start
```

## 📋 Passo a Passo Detalhado

### 1️⃣ Instalar Ferramentas de Compilação

O pacote `better-sqlite3` precisa ser compilado no seu sistema.

**Fedora/RHEL:**
```bash
sudo dnf install gcc-c++ make
```

**Ubuntu/Debian:**
```bash
sudo apt-get install build-essential
```

### 2️⃣ Verificar Instalação

```bash
g++ --version
make --version
```

Você deve ver as versões instaladas.

### 3️⃣ Limpar Instalação Anterior

```bash
rm -rf node_modules package-lock.json
```

### 4️⃣ Instalar Dependências

```bash
npm install
```

Agora deve funcionar sem erros! ✅

### 5️⃣ Criar Banco de Dados

```bash
npm run init-db
```

Saída esperada:
```
✅ Banco de dados inicializado!
📝 Usuário admin criado:
   Username: admin
   Senha: Cristomesalvou@123##
```

### 6️⃣ Iniciar Servidor

```bash
npm start
```

Saída esperada:
```
🚀 Servidor rodando em http://localhost:3000
📖 Acesse http://localhost:3000 para fazer login
```

### 7️⃣ Acessar Aplicação

1. Abra navegador em: `http://localhost:3000`
2. Faça login com:
   - **Usuário**: `admin`
   - **Senha**: `Cristomesalvou@123##`

## 🆘 Se Ainda Houver Problemas

### Problema: Não tem permissão sudo

Se você não pode instalar `g++`, use uma alternativa sem compilação:

```bash
# Desinstalar better-sqlite3
npm uninstall better-sqlite3

# Instalar alternativa em JavaScript puro
npm install sql.js
```

**Nota**: Isso requer modificações no código do servidor.

### Problema: Porta 3000 em uso

```bash
# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Ou use outra porta
PORT=8080 npm start
```

### Problema: Erro de permissão no banco

```bash
chmod 664 biblia.db
```

## 📚 Documentação Completa

- **DIAGNOSTICO_INSTALACAO.md** - Análise detalhada dos erros
- **ESTRUTURA.md** - Organização do projeto
- **docs/README.md** - Documentação técnica
- **docs/INSTALACAO_ATUALIZADO.md** - Guia completo

## ⚡ TL;DR - Comandos Completos

```bash
# Tudo de uma vez (Fedora)
sudo dnf install gcc-c++ make && \
rm -rf node_modules package-lock.json && \
npm install && \
npm run init-db && \
npm start
```

## ✅ Checklist de Verificação

- [ ] `g++` instalado (`g++ --version`)
- [ ] `make` instalado (`make --version`)
- [ ] `npm install` executado com sucesso
- [ ] `biblia.db` criado na raiz
- [ ] Servidor iniciado (`npm start`)
- [ ] Login funcionando em `http://localhost:3000`

---

**Após seguir estes passos, sua aplicação estará funcionando!** 🎉
