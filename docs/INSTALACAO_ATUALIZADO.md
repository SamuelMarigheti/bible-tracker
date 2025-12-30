# Guia de Instalação Atualizado

## Estrutura Profissional Organizada ✅

O projeto foi reorganizado seguindo padrões profissionais. Veja `ESTRUTURA.md` na raiz para detalhes.

## Pré-requisitos

### 1. Node.js
- Node.js v14+ instalado
- Verifique: `node -v`

### 2. Ferramentas de Compilação (para better-sqlite3)

**Linux (Fedora/RHEL):**
```bash
sudo dnf install gcc-c++ make python3
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install build-essential python3
```

**macOS:**
```bash
xcode-select --install
```

**Windows:**
- Instale [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
- Ou use: `npm install --global windows-build-tools`

## Instalação

### Passo 1: Instalar Dependências

```bash
npm install
```

**Se der erro no better-sqlite3**, instale as ferramentas de compilação acima e tente novamente.

### Passo 2: Criar Banco de Dados

```bash
npm run init-db
```

✅ Você verá:
```
✅ Banco de dados inicializado!
📝 Usuário admin criado:
   Username: admin
   Senha: admin123
⚠️  IMPORTANTE: Troque a senha do admin após o primeiro login!
```

### Passo 3: Iniciar Servidor

```bash
npm start
```

✅ Servidor rodando em `http://localhost:3000`

### Passo 4: Acessar Aplicação

1. Abra `http://localhost:3000`
2. Login com:
   - **Usuário**: `admin`
   - **Senha**: `admin123`

## Scripts Disponíveis

```bash
npm start          # Inicia servidor (produção)
npm run dev        # Inicia com auto-reload (desenvolvimento)
npm run init-db    # Inicializa banco de dados
```

## Estrutura de Arquivos

Veja o arquivo `ESTRUTURA.md` na raiz do projeto para entender a organização completa.

### Principais Mudanças

✅ **Backend** em `src/server/`
✅ **Frontend** em `src/public/`
✅ **Documentação** em `docs/`
✅ **Scripts** em `scripts/`
✅ **Configurações** em `config/`

### Caminhos Atualizados

- HTML: `src/public/views/`
- JavaScript: `src/public/js/`
- Ícones: `src/public/assets/icons/`
- Servidor: `src/server/server.js`
- Banco: `biblia.db` (raiz)

## Troubleshooting

### Erro: "Cannot find package 'better-sqlite3'"

**Solução 1:** Instale ferramentas de compilação
```bash
# Fedora/RHEL
sudo dnf install gcc-c++ make python3

# Ubuntu/Debian
sudo apt-get install build-essential

# Depois reinstale
rm -rf node_modules package-lock.json
npm install
```

**Solução 2:** Use alternativa sem compilação
Se não conseguir instalar as ferramentas, considere usar `sql.js` (SQLite em JavaScript puro):

```bash
npm uninstall better-sqlite3
npm install sql.js
```

(Requer ajustes no código - consulte a documentação)

### Erro: "Port 3000 already in use"

```bash
# Linux/Mac
lsof -i :3000
kill -9 PID

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Ou use outra porta
PORT=8080 npm start
```

### Erro: "SQLITE_CANTOPEN"

```bash
# Dar permissão de escrita
chmod 664 biblia.db

# Ou recriar banco
rm biblia.db
npm run init-db
```

## Deploy

Veja `docs/README.md` para instruções completas de deploy em:
- VPS (Ubuntu/Debian)
- Railway.app
- Render.com
- Heroku

## Estrutura Profissional

Esta reorganização traz benefícios:

✅ **Manutenibilidade**: Código organizado e fácil de encontrar
✅ **Escalabilidade**: Estrutura preparada para crescimento
✅ **Profissionalismo**: Padrões da indústria
✅ **Documentação**: Separada e organizada
✅ **Deploy**: Mais fácil em diferentes plataformas

## Próximos Passos

1. ✅ Instalar dependências
2. ✅ Criar banco de dados
3. ✅ Iniciar servidor
4. ✅ Criar usuários no painel admin
5. ✅ Testar funcionalidades
6. ✅ Fazer backup regular do banco
7. ✅ Preparar para deploy

## Suporte

- 📖 Documentação completa: `docs/README.md`
- 🏗️ Estrutura do projeto: `ESTRUTURA.md`
- 📝 Changelog: `docs/CHANGELOG.md`

Pronto para uso! 🎉
