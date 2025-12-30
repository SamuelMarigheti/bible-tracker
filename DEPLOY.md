# 🚀 Guia de Deploy - Plano de Leitura Bíblica

Este guia mostra como fazer deploy da aplicação no **Render.com** (recomendado e gratuito).

## 📋 Pré-requisitos

1. Conta no GitHub
2. Código commitado no GitHub
3. Conta no Render.com (grátis)

---

## 🎯 Deploy no Render.com (Recomendado)

### Passo 1: Preparar o Repositório

Certifique-se de que todas as alterações estão commitadas:

```bash
git add .
git commit -m "Preparar para deploy no Render"
git push origin main
```

### Passo 2: Criar Conta no Render

1. Acesse: https://render.com
2. Clique em **"Get Started for Free"**
3. Cadastre-se com sua conta do GitHub

### Passo 3: Conectar o Repositório

1. No dashboard do Render, clique em **"New +"** → **"Web Service"**
2. Clique em **"Connect a repository"**
3. Autorize o Render a acessar seus repositórios
4. Selecione o repositório `bible-tracker` (ou o nome que você deu)

### Passo 4: Configurar o Serviço

O Render vai detectar automaticamente as configurações do arquivo `render.yaml`, mas você pode revisar:

**Configurações principais:**
- **Name:** `biblia-leitura-tracker` (ou escolha outro)
- **Environment:** `Node`
- **Region:** `Oregon` (mais próximo do Brasil entre as opções gratuitas)
- **Branch:** `main`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

### Passo 5: Configurar Disco Persistente

⚠️ **IMPORTANTE**: Para o banco SQLite funcionar, você PRECISA adicionar um disco persistente.

1. Ainda na configuração, role até **"Disks"**
2. Clique em **"Add Disk"**
3. Configure:
   - **Name:** `biblia-data`
   - **Mount Path:** `/opt/render/project/data`
   - **Size:** `1 GB` (suficiente para o SQLite)

### Passo 6: Variáveis de Ambiente (Opcional)

O `render.yaml` já configura tudo automaticamente, mas você pode customizar:

1. Role até **"Environment Variables"**
2. Variáveis já configuradas automaticamente:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `SESSION_SECRET` (gerado automaticamente)
   - `DATABASE_PATH=/opt/render/project/data/biblia.db`

### Passo 7: Deploy!

1. Clique em **"Create Web Service"**
2. Aguarde o build (3-5 minutos)
3. Quando aparecer "Live", sua aplicação está no ar! 🎉

### Passo 8: Acessar a Aplicação

Sua URL será algo como: `https://biblia-leitura-tracker.onrender.com`

**Credenciais padrão do admin:**
- **Usuário:** `admin`
- **Senha:** `Cristomesalvou@123##`

⚠️ **IMPORTANTE**: Troque a senha do admin imediatamente após o primeiro login!

---

## 🔧 Configurações Avançadas

### Domínio Personalizado

1. No dashboard do Render, clique no seu serviço
2. Vá em **"Settings"** → **"Custom Domains"**
3. Adicione seu domínio
4. Configure o DNS conforme instruções

### Backups do Banco de Dados

Para fazer backup do SQLite:

```bash
# Baixar o banco via SSH (requer plano pago)
# OU configurar backups automáticos no painel do Render
```

### Logs e Monitoramento

- Acesse **"Logs"** no painel do Render
- Veja erros, acessos e performance em tempo real

---

## ⚠️ Limitações do Plano Gratuito

- **Sleep automático**: App dorme após 15 minutos de inatividade
- **Cold start**: Primeiro acesso após sleep leva ~30 segundos
- **750 horas/mês**: Suficiente para projetos pessoais

### Como evitar o sleep (opcional):

Use um serviço de ping como:
- **UptimeRobot** (https://uptimerobot.com)
- **Cron-job.org** (https://cron-job.org)

Configure para fazer ping a cada 10 minutos.

---

## 🐛 Troubleshooting

### Erro: "No such file or directory"

- Verifique se o disco persistente foi criado corretamente
- Certifique-se que o `Mount Path` é `/opt/render/project/data`

### Erro: "Module not found"

- Verifique se `package.json` está correto
- Execute `npm install` localmente antes de commitar

### App não inicia

- Verifique os logs no painel do Render
- Certifique-se que `PORT` está configurado corretamente

### Banco de dados vazio após deploy

- O script `init-db.js` é executado automaticamente no build
- Verifique os logs para confirmar a criação do admin

---

## 📞 Suporte

- Documentação Render: https://render.com/docs
- Issues do projeto: https://github.com/seu-usuario/bible-tracker/issues

---

## 🎉 Pronto!

Sua aplicação está rodando em produção! Compartilhe a URL com seus usuários e aproveite! 📖✨
