# Plano de Leitura Bíblica - Sistema Multi-Usuário

Sistema profissional de acompanhamento de leitura bíblica com múltiplos usuários, painel administrativo e arquitetura escalável.

## 🚀 Início Rápido

```bash
# 1. Instalar dependências
npm install

# 2. Criar banco de dados
npm run init-db

# 3. Iniciar servidor
npm start
```

Acesse: `http://localhost:3000`

**Login inicial:**
- Usuário: `admin`
- Senha: `Cristomesalvou@123##`

## 📁 Estrutura do Projeto

```
biblia-leitura/
├── config/          # Configurações
├── docs/            # Documentação completa
├── scripts/         # Scripts utilitários
└── src/
    ├── server/      # Backend (Node.js + Express)
    └── public/      # Frontend (HTML/CSS/JS)
        ├── views/   # Páginas HTML
        ├── js/      # JavaScript
        └── assets/  # Ícones e recursos
```

**Veja `ESTRUTURA.md` para detalhes completos da organização.**

## 📚 Documentação

- 📖 **[ESTRUTURA.md](ESTRUTURA.md)** - Organização profissional do projeto
- 🔧 **[docs/INSTALACAO_ATUALIZADO.md](docs/INSTALACAO_ATUALIZADO.md)** - Guia de instalação completo
- 📝 **[docs/README.md](docs/README.md)** - Documentação técnica detalhada
- 🚀 **[docs/CHANGELOG.md](docs/CHANGELOG.md)** - Histórico de versões

## ✨ Recursos

- ✅ Sistema multi-usuário com autenticação
- ✅ Painel administrativo completo
- ✅ Progresso individual por usuário
- ✅ Admin acompanha todos os usuários
- ✅ Banco SQLite (50+ usuários)
- ✅ PWA (funciona offline)
- ✅ Interface elegante e responsiva
- ✅ Estrutura profissional escalável

## 🛠️ Tecnologias

- **Backend**: Node.js + Express
- **Banco**: SQLite (better-sqlite3)
- **Autenticação**: bcrypt + sessions
- **Frontend**: HTML5 + CSS3 + Vanilla JS
- **PWA**: Service Workers

## ⚙️ Pré-requisitos

- Node.js v14+
- Ferramentas de compilação (gcc, make, python3)

**Linux (Fedora):**
```bash
sudo dnf install gcc-c++ make python3
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install build-essential python3
```

## 📦 Scripts NPM

```bash
npm start          # Servidor produção
npm run dev        # Servidor desenvolvimento
npm run init-db    # Inicializar banco
```

## 🔐 Segurança

- Senhas criptografadas (bcrypt)
- Sessões seguras (httpOnly cookies)
- Proteção SQL injection
- Rotas protegidas por autenticação

## 🚀 Deploy

Pronto para deploy em:
- VPS (PM2 + Nginx)
- Railway.app
- Render.com
- Heroku

Veja `docs/README.md` para instruções completas.

## 📋 Licença

MIT

---

**Versão**: 2.0.0 - Estrutura Profissional Organizada 🎉
