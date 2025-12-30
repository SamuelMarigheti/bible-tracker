# Deploy no GitHub e Netlify

## Preparação Realizada ✅

Os seguintes arquivos foram criados para deployment:

- ✅ `netlify.toml` - Configuração do Netlify
- ✅ `.github/workflows/deploy.yml` - CI/CD GitHub Actions
- ✅ `package.json` - Scripts de build atualizados
- ✅ `.gitignore` - Arquivos para ignorar no git

## Passo 1: Preparar Repositório GitHub

### 1.1 Inicializar Git

```bash
cd /home/samuka/Documentos/Biblia

# Inicializar repositório
git init

# Adicionar arquivos
git add .

# Primeiro commit
git commit -m "feat: Sistema de leitura bíblica multi-usuário v2.0

- Interface redesenhada com sidebar
- Sistema multi-usuário
- Banco SQLite
- PWA ready
- Deploy ready para Netlify"
```

### 1.2 Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Nome do repositório: `biblia-leitura-365`
3. Descrição: `Sistema de acompanhamento de leitura bíblica cronológica`
4. Público ou Privado (sua escolha)
5. **NÃO** adicione README, .gitignore ou licença (já temos)
6. Clique em "Create repository"

### 1.3 Conectar Repositório Local

```bash
# Substituir SEU-USUARIO pelo seu username do GitHub
git remote add origin https://github.com/SEU-USUARIO/biblia-leitura-365.git

# Enviar código
git branch -M main
git push -u origin main
```

## Passo 2: Deploy no Netlify

### Opção A: Via GitHub (Recomendado)

1. Acesse: https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Escolha "GitHub"
4. Autorize o Netlify a acessar seus repositórios
5. Selecione `biblia-leitura-365`
6. Configurações:
   - **Build command**: `npm run build:netlify`
   - **Publish directory**: `src/public`
   - **Environment variables**: (deixe vazio por enquanto)
7. Click "Deploy site"

### Opção B: Via Netlify CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Inicializar site
netlify init

# Deploy
netlify deploy --prod
```

## Passo 3: Configurar Secrets (GitHub Actions)

Para que o CI/CD funcione, adicione secrets no GitHub:

1. No GitHub, vá em: `Settings` → `Secrets and variables` → `Actions`
2. Adicione os seguintes secrets:
   - `NETLIFY_AUTH_TOKEN`: Token do Netlify
   - `NETLIFY_SITE_ID`: ID do site no Netlify

### Como Obter NETLIFY_AUTH_TOKEN

1. Acesse: https://app.netlify.com/user/applications
2. Click "New access token"
3. Nome: `GitHub Actions`
4. Copie o token gerado

### Como Obter NETLIFY_SITE_ID

1. No Netlify, abra seu site
2. Vá em `Site settings`
3. Copie o "Site ID" (começa com números e letras)

## Passo 4: Configurações Adicionais

### 4.1 Custom Domain (Opcional)

No Netlify:
1. `Domain settings` → `Add custom domain`
2. Siga instruções para configurar DNS

### 4.2 HTTPS

HTTPS é automático no Netlify (Let's Encrypt)

### 4.3 Environment Variables (Netlify)

Se precisar de variáveis de ambiente:

1. Netlify Dashboard → `Site settings` → `Environment variables`
2. Add variable

## Passo 5: Configurar Backend (Importante!)

⚠️ **ATENÇÃO**: O backend Node.js (server.js) **NÃO** rodará no Netlify!

Netlify é para sites **estáticos**. Para o backend, você tem 3 opções:

### Opção 1: Netlify Functions (Serverless)

Converter rotas do Express para Netlify Functions:

```javascript
// netlify/functions/api.js
exports.handler = async (event, context) => {
  // Sua lógica aqui
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello' })
  };
};
```

### Opção 2: Deploy Backend Separado

Backend em outro serviço:
- **Railway.app** (recomendado para Node.js)
- **Render.com**
- **Heroku**
- **VPS** próprio

Depois atualizar frontend para apontar para API:

```javascript
const API_URL = 'https://seu-backend.railway.app';
```

### Opção 3: Modo Offline (SQLite no navegador)

Usar `sql.js` para rodar SQLite no navegador (frontend only).

## Arquivos de Configuração

### netlify.toml

```toml
[build]
  publish = "src/public"
  command = "npm run build:netlify"

[[redirects]]
  from = "/*"
  to = "/views/login.html"
  status = 200
```

### .github/workflows/deploy.yml

Deploy automático a cada push na branch `main`.

## Estrutura para Deploy

```
biblia-leitura-365/
├── src/
│   ├── public/          # ← FRONTEND (Netlify)
│   │   ├── views/
│   │   ├── js/
│   │   └── assets/
│   └── server/          # ← BACKEND (Railway/Render)
│       ├── server.js
│       └── init-db.js
├── netlify.toml
├── package.json
└── .github/
    └── workflows/
        └── deploy.yml
```

## Checklist de Deploy

### GitHub
- [ ] Repositório criado
- [ ] Código enviado (`git push`)
- [ ] Secrets configurados (NETLIFY_AUTH_TOKEN, NETLIFY_SITE_ID)

### Netlify
- [ ] Site conectado ao GitHub
- [ ] Build settings configurados
- [ ] Deploy bem-sucedido
- [ ] URL funcionando

### Opcional
- [ ] Custom domain configurado
- [ ] Backend separado deployado
- [ ] DNS configurado

## URLs Úteis

- **Netlify Dashboard**: https://app.netlify.com
- **GitHub**: https://github.com
- **Railway (backend)**: https://railway.app
- **Render (backend)**: https://render.com

## Troubleshooting

### Build Falha no Netlify

```bash
# Testar localmente
npm run build:netlify
```

### Site não carrega

Verifique:
1. Publish directory: `src/public`
2. Redirects em `netlify.toml`

### API não funciona

Backend precisa estar deployado separadamente (Railway/Render).

## Próximos Passos

1. ✅ Instalar dependências: `npm install`
2. ✅ Criar repositório GitHub
3. ✅ Push código
4. ✅ Conectar Netlify
5. ✅ Deploy backend (Railway/Render)
6. ✅ Atualizar URLs da API no frontend

---

**Versão**: 2.0.0
**Data**: 2025-12-29
**Status**: Pronto para deploy 🚀
