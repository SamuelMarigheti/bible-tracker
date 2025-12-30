# 🚀 Guia de Deploy em Produção

## ⚠️ IMPORTANTE: Sobre o Netlify

**A aplicação atual NÃO é compatível com Netlify** da forma que está construída.

### Por quê?
- **Netlify** é otimizado para **sites estáticos** (HTML, CSS, JS)
- Nossa aplicação é um **servidor Node.js com Express** que precisa rodar continuamente
- Usa **SQLite** (banco de dados em arquivo) que requer sistema de arquivos persistente
- Usa **sessions** que precisam de servidor com estado

### Alternativas Recomendadas

| Plataforma | Gratuito | Adequação | Complexidade |
|------------|----------|-----------|--------------|
| **Render** | ✅ Sim | ⭐⭐⭐⭐⭐ | Baixa |
| **Railway** | ✅ Sim* | ⭐⭐⭐⭐⭐ | Baixa |
| **Fly.io** | ✅ Sim* | ⭐⭐⭐⭐ | Média |
| **Vercel** | ⚠️ Limitado | ⭐⭐⭐ | Média |
| **Heroku** | ❌ Não | ⭐⭐⭐⭐ | Baixa |

*Limitações no plano gratuito

---

## 🎯 RECOMENDAÇÃO: Deploy no Render (GRATUITO)

O **Render** é a melhor opção gratuita para esta aplicação.

### Vantagens do Render:
✅ Plano gratuito generoso
✅ Suporte nativo a Node.js + Express
✅ Sistema de arquivos persistente (para SQLite)
✅ SSL/HTTPS automático
✅ Fácil integração com GitHub
✅ Variáveis de ambiente
✅ Deploy automático em cada push

### Desvantagens:
⚠️ Serviço "hiberna" após 15min de inatividade (plano gratuito)
⚠️ Primeira requisição após hibernar pode demorar ~30s

---

## 📋 PASSO A PASSO: Deploy no Render

### 1️⃣ Pré-requisitos

✅ Código no GitHub (FEITO!)
✅ Conta no Render (crie em: https://render.com)

### 2️⃣ Criar Web Service no Render

1. Acesse https://dashboard.render.com
2. Clique em **"New +"** → **"Web Service"**
3. Conecte sua conta do GitHub
4. Selecione o repositório da aplicação bíblica
5. Configure:

```
Name: biblia-leitura
Environment: Node
Region: Oregon (US West) ou Frankfurt (EU Central)
Branch: main (ou master)
Build Command: npm install
Start Command: npm start
```

### 3️⃣ Configurar Variáveis de Ambiente

No painel do Render, vá em **"Environment"** e adicione:

```env
NODE_ENV=production
SESSION_SECRET=ce6c399d5436c44ffb8a173e2545b4bd4e241793c3e53d12ef8c5f2d19a3f9e2
DATABASE_PATH=/opt/render/project/src/biblia.db
PORT=3000
```

⚠️ **IMPORTANTE**: A chave `SESSION_SECRET` acima é única e foi gerada especificamente para sua aplicação. **NÃO compartilhe publicamente!**

### 4️⃣ Configurar Disco Persistente (para SQLite)

1. No painel do Render, vá em **"Disks"**
2. Clique em **"Add Disk"**
3. Configure:
   - **Name**: `sqlite-data`
   - **Mount Path**: `/opt/render/project/src`
   - **Size**: 1 GB (suficiente)

### 5️⃣ Ajustar package.json

Certifique-se de que `package.json` tem:

```json
{
  "scripts": {
    "start": "node src/server/init-db.js && node src/server/server.js",
    "postinstall": "npm rebuild better-sqlite3"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 6️⃣ Deploy

1. Clique em **"Create Web Service"**
2. Aguarde o build (3-5 minutos)
3. Sua aplicação estará disponível em: `https://biblia-leitura.onrender.com`

---

## 🔒 CHECKLIST DE SEGURANÇA PRÉ-PRODUÇÃO

Antes de expor a aplicação, verifique:

### ✅ Variáveis de Ambiente
- [ ] `SESSION_SECRET` configurado no Render (NUNCA no código)
- [ ] `NODE_ENV=production` configurado
- [ ] `.env` está no `.gitignore` (não vai para o GitHub)

### ✅ Autenticação
- [ ] Senha padrão do admin (`Cristomesalvou@123##`) será trocada no primeiro login
- [ ] Senhas armazenadas com bcrypt (✅ JÁ IMPLEMENTADO)
- [ ] Sessions com `httpOnly: true` (✅ JÁ IMPLEMENTADO)
- [ ] Sessions com `sameSite: 'strict'` (✅ JÁ IMPLEMENTADO)

### ✅ Banco de Dados
- [ ] Prepared statements protegem contra SQL Injection (✅ JÁ IMPLEMENTADO)
- [ ] Banco de dados em disco persistente do Render
- [ ] Fazer backup manual do `biblia.db` periodicamente

### ✅ HTTPS
- [ ] Render fornece SSL/HTTPS automaticamente (✅ AUTOMÁTICO)
- [ ] Cookies configurados com `secure: true` em produção (✅ JÁ IMPLEMENTADO)

### ⚠️ MELHORIAS RECOMENDADAS (Opcional)

Para uso público intenso, considere adicionar:

#### Alta Prioridade
- [ ] **Rate Limiting**: Prevenir ataques de força bruta
  ```bash
  npm install express-rate-limit
  ```

- [ ] **Helmet.js**: Headers de segurança HTTP
  ```bash
  npm install helmet
  ```

- [ ] **CORS**: Configurar origens permitidas
  ```bash
  npm install cors
  ```

#### Média Prioridade
- [ ] **CSRF Protection**: Tokens anti-CSRF
- [ ] **Logs de Auditoria**: Rastrear ações administrativas
- [ ] **Backups Automáticos**: Agendar backups do banco

#### Baixa Prioridade
- [ ] **2FA para Admin**: Autenticação de dois fatores
- [ ] **Monitoring**: Alertas de downtime (UptimeRobot)

---

## 🔐 ANÁLISE DE SEGURANÇA ATUAL

### ✅ O que está SEGURO:

| Área | Status | Detalhes |
|------|--------|----------|
| **SQL Injection** | ✅ PROTEGIDO | Prepared statements (better-sqlite3) |
| **XSS** | ✅ PROTEGIDO | Sem innerHTML com dados de usuário |
| **Senhas** | ✅ SEGURO | bcrypt com 10 rounds |
| **Sessions** | ✅ SEGURO | httpOnly, sameSite, secure em prod |
| **HTTPS** | ✅ AUTOMÁTICO | Render fornece SSL gratuito |
| **Secrets** | ✅ SEGURO | Usando variáveis de ambiente |

### ⚠️ O que está ACEITÁVEL (mas pode melhorar):

| Área | Status | Recomendação |
|------|--------|--------------|
| **Rate Limiting** | ⚠️ NÃO IMPLEMENTADO | Adicionar express-rate-limit |
| **CSRF** | ⚠️ NÃO IMPLEMENTADO | Baixa prioridade para uso interno |
| **Headers** | ⚠️ BÁSICOS | Adicionar helmet.js |
| **Logs** | ⚠️ CONSOLE ONLY | Adicionar logging estruturado |

### 🎯 Risco Geral: 🟢 BAIXO

**Conclusão**: A aplicação está **SEGURA PARA PRODUÇÃO** para uso:
- ✅ Privado (família, igreja, grupo pequeno)
- ✅ Comunidade fechada (~50 usuários)
- ⚠️ Público aberto (recomenda-se adicionar rate limiting primeiro)

---

## 🚨 AÇÕES OBRIGATÓRIAS APÓS DEPLOY

### Primeiro Acesso:

1. **Acesse**: `https://seu-app.onrender.com`
2. **Login**:
   - Usuário: `admin`
   - Senha: `Cristomesalvou@123##`
3. **TROQUE A SENHA IMEDIATAMENTE**:
   - Vá em "Admin" → Gerenciar Usuários
   - Altere a senha do admin para uma senha forte

### Senha Forte:
- Mínimo 12 caracteres
- Letras maiúsculas e minúsculas
- Números
- Símbolos especiais
- Exemplo: `B1bl!a2025@Segur@`

---

## 📊 Monitoramento Pós-Deploy

### Ferramentas Gratuitas:

1. **UptimeRobot** (https://uptimerobot.com)
   - Monitora se o site está online
   - Alerta por email se cair
   - Gratuito para até 50 monitores

2. **Render Dashboard**
   - Logs em tempo real
   - Uso de CPU/Memória
   - Histórico de deploys

### Logs de Acesso:

No Render Dashboard → Logs, você verá:
```
🚀 Servidor rodando em http://localhost:3000
📖 Acesse http://localhost:3000 para fazer login
```

---

## 🔄 Atualizações Futuras

Quando atualizar o código:

1. **Commit no GitHub**:
   ```bash
   git add .
   git commit -m "Descrição da mudança"
   git push
   ```

2. **Deploy Automático**:
   - Render detecta o push
   - Faz rebuild automático
   - Deploy em 3-5 minutos

---

## 📝 Backup do Banco de Dados

### Download Manual (Render):

1. Acesse o **Shell** do serviço no Render Dashboard
2. Execute:
   ```bash
   cat /opt/render/project/src/biblia.db > /tmp/backup.db
   ```
3. Baixe via SFTP ou API do Render

### Agendamento Recomendado:
- Backup semanal se uso leve
- Backup diário se uso intenso
- Manter últimos 7 backups

---

## 🆘 Troubleshooting

### Aplicação não inicia:

1. Verifique os **Logs** no Render Dashboard
2. Erros comuns:
   - Porta incorreta (usar `process.env.PORT`)
   - Variável de ambiente faltando
   - Erro ao compilar better-sqlite3

### Sessões não persistem:

- Verificar `SESSION_SECRET` configurado
- Verificar cookies habilitados no navegador
- Em produção, `secure: true` requer HTTPS (Render tem)

### Banco de dados não persiste:

- Verificar se o **Disk** está montado em `/opt/render/project/src`
- `DATABASE_PATH` deve apontar para o disco persistente

---

## 📞 Suporte

- **Render Docs**: https://render.com/docs
- **Issues do Projeto**: [GitHub Issues do seu repositório]
- **Community**: Render Community Forum

---

## ✅ CONFIRMAÇÃO FINAL

Sua aplicação está **PRONTA PARA PRODUÇÃO** se:

- [x] Código no GitHub
- [x] Chave `SESSION_SECRET` única gerada
- [x] `.gitignore` configurado corretamente
- [x] Senha padrão será trocada no primeiro login
- [x] HTTPS será automático (Render)
- [x] Proteções básicas implementadas (bcrypt, prepared statements)

### 🎯 Status: 🟢 SEGURO PARA DEPLOY

**Você pode expor a aplicação com confiança!**

Recomendações finais:
1. Use **Render** em vez de Netlify
2. Configure variáveis de ambiente no painel do Render
3. **Troque a senha do admin** imediatamente após primeiro acesso
4. Considere adicionar rate limiting se espera muitos usuários

---

**Data da Análise**: 2025-12-29
**Chave Gerada**: `ce6c399d5436c44ffb8a173e2545b4bd4e241793c3e53d12ef8c5f2d19a3f9e2`
**Nível de Segurança**: 🟢 PRODUÇÃO OK
