# Estrutura do Projeto

Este documento descreve a organização profissional dos arquivos e pastas do projeto.

## Estrutura de Diretórios

```
biblia-leitura/
├── docs/                        # Documentação do projeto
│   ├── README.md               # Documentação principal
│   ├── INSTALACAO_ATUALIZADO.md # Guia de instalação
│   ├── CHANGELOG.md            # Histórico de mudanças
│   ├── GERAR_ICONES.md         # Instruções para ícones
│   └── OrdemCronologica.pdf    # Plano de leitura cronológica
│
├── scripts/                     # Scripts utilitários
│   ├── start.sh                # Script de inicialização
│   └── install-dependencies.sh # Script de instalação
│
├── src/                         # Código fonte
│   ├── server/                 # Backend (Node.js + Express)
│   │   ├── server.js          # Servidor principal
│   │   ├── init-db.js         # Inicialização do banco
│   │   ├── routes/            # Rotas da API (futuro)
│   │   ├── models/            # Modelos de dados (futuro)
│   │   └── middleware/        # Middleware customizado (futuro)
│   │
│   └── public/                 # Arquivos públicos
│       ├── views/             # Páginas HTML
│       │   ├── login.html     # Tela de login
│       │   ├── admin.html     # Painel administrativo
│       │   └── final.html     # Aplicação principal
│       │
│       ├── js/                # JavaScript do frontend
│       │   ├── api-client.js  # Cliente da API
│       │   ├── app-main.js    # Lógica principal da aplicação
│       │   ├── livros-biblia.js # Dicionário de livros bíblicos
│       │   ├── plano-dados.js # Dados do plano de leitura
│       │   ├── service-worker.js # Service Worker PWA
│       │   └── pwa-installer.js  # Instalador PWA
│       │
│       ├── css/               # Estilos
│       │   └── app.css        # Estilos da aplicação principal
│       │
│       └── assets/            # Recursos estáticos
│           └── icons/         # Ícones e manifest
│               ├── manifest.json
│               ├── icon.svg
│               ├── icon-72.png
│               ├── icon-96.png
│               ├── icon-128.png
│               ├── icon-144.png
│               ├── icon-152.png
│               ├── icon-192.png
│               ├── icon-384.png
│               └── icon-512.png
│
├── .env.example                # Exemplo de variáveis de ambiente
├── .gitignore                  # Arquivos ignorados pelo git
├── biblia.db                   # Banco de dados SQLite (criado após init)
├── DEPLOY_GITHUB_NETLIFY.md    # Guia de deploy
├── DIAGNOSTICO_INSTALACAO.md   # Diagnóstico de problemas de instalação
├── ESTRUTURA.md                # Este arquivo
├── INICIO_RAPIDO.md            # Guia de início rápido
├── netlify.toml                # Configuração Netlify
├── package.json                # Dependências do projeto
├── package-lock.json           # Lock de dependências
├── README.md                   # README principal
└── SECURITY_AUDIT.md           # Auditoria de segurança
```

## Convenções e Padrões

### Backend (src/server/)

- **server.js**: Servidor Express principal com todas as rotas e middleware
- **init-db.js**: Script de inicialização do banco de dados
- **routes/**: (Preparado) Rotas modulares da API
- **models/**: (Preparado) Modelos de dados e lógica de negócio
- **middleware/**: (Preparado) Middleware customizado

### Frontend (src/public/)

#### Views (src/public/views/)
- Arquivos HTML servidos pelo servidor
- Cada view é uma página completa da aplicação
- **login.html**: Interface de autenticação
- **admin.html**: Painel administrativo para gerenciamento de usuários
- **final.html**: Aplicação principal de leitura bíblica

#### CSS (src/public/css/)
- **app.css**: Estilos da aplicação principal com design profissional

#### JavaScript (src/public/js/)
- **api-client.js**: Integração com API REST (autenticação, progresso, conquistas)
- **app-main.js**: Lógica principal da aplicação (navegação, estatísticas, heatmap)
- **livros-biblia.js**: Dicionário de livros bíblicos para tooltips
- **plano-dados.js**: Dados completos do plano de leitura de 365 dias
- **service-worker.js**: Cache offline e funcionalidades PWA
- **pwa-installer.js**: Registro do service worker e prompt de instalação

#### Assets (src/public/assets/)
- **icons/**: Todos os ícones do PWA e manifest.json
- Futuramente pode conter: images/, fonts/, etc.

## Fluxo de Servir Arquivos

1. Express serve arquivos estáticos de `src/public/`
2. Rotas especiais (`/`, `/app`, `/admin`) servem views específicas
3. Assets são acessíveis via `/assets/...`
4. JavaScript via `/js/...`
5. Service Worker registrado em `/js/service-worker.js`

## Caminhos Importantes

### No Código Backend (server.js)
```javascript
const publicDir = path.join(__dirname, '../public');
const rootDir = path.join(__dirname, '../..');
```

### No Frontend (HTML)
```html
<!-- CSS -->
<link rel="stylesheet" href="/css/app.css">

<!-- Manifest e ícones -->
<link rel="manifest" href="/assets/icons/manifest.json">
<link rel="apple-touch-icon" href="/assets/icons/icon-192.png">

<!-- Scripts -->
<script src="/js/api-client.js"></script>
<script src="/js/app-main.js"></script>
<script src="/js/livros-biblia.js"></script>
<script src="/js/plano-dados.js"></script>
<script src="/js/pwa-installer.js"></script>
```

### Service Worker
```javascript
// Registrado em
navigator.serviceWorker.register('/js/service-worker.js')
```

## Banco de Dados

- **Localização**: Raiz do projeto (`biblia.db`)
- **Tipo**: SQLite
- **ORM**: better-sqlite3 (sem ORM, SQL direto)
- **Tabelas**: usuarios, progresso, conquistas

## Scripts NPM

```bash
npm start          # Inicia servidor (produção)
npm run dev        # Inicia com auto-reload (desenvolvimento)
npm run init-db    # Inicializa banco de dados
```

## Migração Futura

A estrutura está preparada para crescimento:

### Possíveis Melhorias
1. **Modularizar rotas**: Mover rotas de `server.js` para `src/server/routes/`
2. **Criar controllers**: Lógica de negócio em `src/server/controllers/`
3. **Separar CSS**: Mover CSS inline para `src/public/css/`
4. **TypeScript**: Adicionar tipagem estática
5. **Testes**: Adicionar pasta `tests/` ou `__tests__/`
6. **Build process**: Webpack, Vite, ou similar para bundling
7. **API separada**: Separar frontend e backend em projetos distintos

### Exemplo de Estrutura Modular (Futuro)
```
src/server/
├── routes/
│   ├── auth.routes.js
│   ├── users.routes.js
│   └── progress.routes.js
├── controllers/
│   ├── auth.controller.js
│   ├── users.controller.js
│   └── progress.controller.js
├── models/
│   ├── User.model.js
│   └── Progress.model.js
├── middleware/
│   ├── auth.middleware.js
│   └── validation.middleware.js
├── config/
│   └── database.js
└── server.js
```

## Boas Práticas Aplicadas

✅ Separação clara entre frontend e backend
✅ Arquivos estáticos organizados por tipo
✅ Documentação separada do código
✅ Scripts utilitários em pasta dedicada
✅ Configurações em local apropriado
✅ Banco de dados na raiz (fácil backup)
✅ Estrutura escalável e profissional
✅ Caminhos relativos e absolutos bem definidos

## Conclusão

Esta estrutura segue padrões profissionais de organização de projetos Node.js/Express, facilitando:
- Manutenção do código
- Onboarding de novos desenvolvedores
- Escalabilidade futura
- Deploy em diferentes ambientes
- Separação de responsabilidades
