# Plano de Leitura Bíblica - Sistema Multi-Usuário

Sistema completo de acompanhamento de leitura bíblica com suporte para múltiplos usuários, painel administrativo e sincronização em tempo real.

## Recursos

- ✅ Sistema de autenticação seguro
- ✅ Painel administrativo para gerenciar usuários
- ✅ Cada usuário tem seu próprio progresso
- ✅ Admin pode acompanhar o progresso de todos
- ✅ Banco de dados SQLite (suporta 50+ usuários)
- ✅ Interface responsiva e elegante
- ✅ PWA (Progressive Web App)
- ✅ Pronto para deploy em produção

## Tecnologias Utilizadas

- **Backend**: Node.js + Express
- **Banco de Dados**: SQLite (better-sqlite3)
- **Autenticação**: bcrypt + express-session
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript

## Instalação

### 1. Instalar dependências

```bash
npm install
```

### 2. Inicializar banco de dados

```bash
npm run init-db
```

Isso criará:
- Banco de dados `biblia.db`
- Tabelas de usuários, progresso e conquistas
- Usuário admin padrão:
  - **Username**: `admin`
  - **Senha**: `admin123`

⚠️ **IMPORTANTE**: Troque a senha do admin após o primeiro login!

### 3. Iniciar servidor

```bash
npm start
```

Ou para desenvolvimento com auto-reload:

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

## Uso

### Primeiro Acesso

1. Acesse `http://localhost:3000`
2. Faça login com:
   - Username: `admin`
   - Senha: `admin123`
3. Você será redirecionado para o painel administrativo

### Painel Administrativo

Como administrador, você pode:

- ✅ Criar novos usuários
- ✅ Trocar senhas de usuários
- ✅ Excluir usuários
- ✅ Visualizar progresso de todos os usuários
- ✅ Acessar sua própria leitura

### Criar Usuários

1. No painel admin, clique em "Novo Usuário"
2. Preencha:
   - Nome completo
   - Nome de usuário (único)
   - Senha (mínimo 6 caracteres)
3. Clique em "Criar"

O usuário poderá fazer login imediatamente com as credenciais criadas.

### Gerenciar Senhas

1. No painel admin, clique em "Senha" ao lado do usuário
2. Digite a nova senha
3. Clique em "Salvar"

### Acompanhar Progresso

No painel admin, aba "Progresso Geral":
- Veja quantos dias cada usuário completou
- Veja a última leitura de cada usuário
- Visualize o progresso em porcentagem
- Clique em "Ver Detalhes" para abrir a leitura do usuário

## Estrutura do Banco de Dados

### Tabela `usuarios`
- `id`: ID único
- `nome`: Nome completo
- `username`: Nome de usuário (único)
- `senha_hash`: Senha criptografada
- `is_admin`: 1 para admin, 0 para usuário comum
- `criado_em`: Data de criação

### Tabela `progresso`
- `id`: ID único
- `usuario_id`: Referência ao usuário
- `dia`: Dia do plano (1-365)
- `concluido`: 1 para concluído, 0 para pendente
- `data_conclusao`: Data/hora da conclusão

### Tabela `conquistas`
- `id`: ID único
- `usuario_id`: Referência ao usuário
- `conquista_id`: ID da conquista
- `desbloqueada_em`: Data/hora do desbloqueio

## Deploy para Produção

### Opção 1: VPS (Ubuntu/Debian)

```bash
# 1. Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Clonar/copiar projeto
cd /var/www
git clone seu-repositorio biblia

# 3. Instalar dependências
cd biblia
npm install --production

# 4. Inicializar banco
npm run init-db

# 5. Instalar PM2 para gerenciar processo
sudo npm install -g pm2

# 6. Iniciar aplicação
pm2 start server.js --name biblia

# 7. Configurar para iniciar no boot
pm2 startup
pm2 save

# 8. Configurar Nginx como proxy reverso
sudo apt install nginx

# Criar arquivo /etc/nginx/sites-available/biblia:
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Ativar site
sudo ln -s /etc/nginx/sites-available/biblia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 9. Instalar SSL (certbot)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

### Opção 2: Railway.app

1. Crie conta em https://railway.app
2. Clique em "New Project" → "Deploy from GitHub"
3. Selecione seu repositório
4. Railway detectará automaticamente o Node.js
5. Adicione variáveis de ambiente:
   - `PORT`: 3000
6. Deploy automático!

### Opção 3: Render.com

1. Crie conta em https://render.com
2. Clique em "New" → "Web Service"
3. Conecte seu repositório
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Deploy!

### Opção 4: Heroku

```bash
# 1. Instalar Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# 2. Login
heroku login

# 3. Criar app
heroku create biblia-leitura

# 4. Deploy
git push heroku main

# 5. Inicializar banco (via Heroku CLI)
heroku run npm run init-db
```

## Configurações de Produção

Antes do deploy em produção, edite `server.js`:

```javascript
// Linha ~16-18
app.use(session({
  secret: 'TROQUE-ESTE-SECRET-POR-UM-VALOR-ALEATORIO-FORTE',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // true em produção com HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));
```

## Backup do Banco de Dados

Para fazer backup:

```bash
# Copiar arquivo do banco
cp biblia.db biblia.db.backup-$(date +%Y%m%d)
```

Para restaurar:

```bash
cp biblia.db.backup-YYYYMMDD biblia.db
pm2 restart biblia
```

## Segurança

✅ **Senhas**: Criptografadas com bcrypt (10 rounds)
✅ **Sessões**: HttpOnly cookies, expiram em 24h
✅ **SQL Injection**: Protegido (prepared statements)
✅ **XSS**: Sanitização de dados

### Recomendações Adicionais

- Use HTTPS em produção
- Troque o secret da sessão
- Configure firewall (UFW)
- Atualize regularmente as dependências
- Faça backups automáticos do banco

## Troubleshooting

### Erro: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Permission denied" no banco
```bash
chmod 664 biblia.db
```

### Servidor não inicia
```bash
# Verificar se porta 3000 está em uso
lsof -i :3000
# Matar processo se necessário
kill -9 PID
```

## Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

## Licença

MIT
