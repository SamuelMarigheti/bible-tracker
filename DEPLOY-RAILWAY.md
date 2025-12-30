# 🚂 Deploy no Railway.app (GRATUITO)

## Por que Railway?
- ✅ **Disco persistente GRATUITO** (até 1GB)
- ✅ **$5 em créditos mensais** (suficiente para apps pequenos)
- ✅ **Não dorme** como o Render
- ✅ **Setup super simples**

---

## 📋 Passo a Passo

### 1️⃣ Criar conta no Railway

1. Acesse: https://railway.app
2. Clique em **"Login"**
3. Faça login com sua conta do GitHub
4. Aceite as permissões

### 2️⃣ Criar novo projeto

1. No dashboard, clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha seu repositório: `bible-tracker` (ou o nome que você deu)
4. Clique no repositório para selecioná-lo

### 3️⃣ Configurar variáveis de ambiente

O Railway detectará automaticamente que é uma app Node.js!

1. Clique na aba **"Variables"**
2. Adicione estas variáveis:

```
NODE_ENV=production
PORT=3000
SESSION_SECRET=<clique em "Generate" para gerar automaticamente>
DATABASE_PATH=/app/data/biblia.db
```

**IMPORTANTE:** Para o `SESSION_SECRET`, clique no botão "Generate" do Railway para gerar um valor aleatório seguro.

### 4️⃣ Configurar volume persistente

⚠️ **CRÍTICO**: Sem isso o banco será apagado a cada deploy!

1. Clique na aba **"Settings"**
2. Role até **"Volumes"**
3. Clique em **"+ New Volume"**
4. Configure:
   - **Mount Path:** `/app/data`
   - Clique em **"Add"**

### 5️⃣ Deploy!

1. Volte para a aba **"Deployments"**
2. O deploy já deve ter começado automaticamente
3. Aguarde alguns minutos (~3-5 min)
4. Quando aparecer "Success" ✅, sua app está no ar!

### 6️⃣ Acessar a aplicação

1. Clique na aba **"Settings"**
2. Role até **"Domains"**
3. Clique em **"Generate Domain"**
4. Sua URL será algo como: `https://seu-app.up.railway.app`

**Credenciais padrão:**
- **Usuário:** `admin`
- **Senha:** `Cristomesalvou@123##`

⚠️ **Troque a senha após o primeiro login!**

---

## 🔧 Comandos Úteis (opcional)

### Instalar Railway CLI (para deploy via terminal)

```bash
# Linux/Mac
curl -fsSL https://railway.app/install.sh | sh

# Fazer login
railway login

# Deploy
railway up

# Ver logs
railway logs
```

---

## 📊 Monitoramento

### Ver logs em tempo real

1. No dashboard do Railway, clique no seu projeto
2. Clique na aba **"Deployments"**
3. Clique no deployment ativo
4. Veja os logs em tempo real

Procure por:
```
📊 Conectando ao banco: /app/data/biblia.db
👥 Usuários no banco: X
🚀 Servidor rodando em http://localhost:3000
```

---

## 💰 Custos e Limites

### Plano Gratuito
- **$5 em créditos mensais**
- **1GB de volume persistente**
- **500h de execução/mês**
- **100GB de largura de banda/mês**

### Para um app pequeno:
- ✅ Custo mensal: **~$2-3** (sobra crédito!)
- ✅ Não precisa cartão de crédito (usa os créditos)

---

## 🐛 Troubleshooting

### Erro: "No such file or directory"

**Solução:**
1. Verifique se o volume foi criado em "Settings" → "Volumes"
2. Mount path deve ser exatamente: `/app/data`
3. Faça "Redeploy" após adicionar o volume

### Erro: "Module not found"

**Solução:**
1. Certifique-se que `package.json` está correto
2. Verifique se todas as dependências estão listadas
3. Tente "Clear Cache" e redeploy

### App reinicia constantemente

**Solução:**
1. Veja os logs: clique em "Deployments" → log ativo
2. Procure por erros na inicialização
3. Verifique se `PORT` está configurado corretamente

### Banco de dados vazio

**Solução:**
1. Verifique os logs: deve aparecer "Banco de dados inicializado"
2. Se não aparecer, o `npm run build` não rodou
3. Faça "Redeploy" manualmente

---

## 🎯 Checklist de Deploy

- [ ] Conta criada no Railway
- [ ] Repositório conectado
- [ ] Variáveis de ambiente configuradas (NODE_ENV, PORT, SESSION_SECRET, DATABASE_PATH)
- [ ] Volume criado em `/app/data`
- [ ] Deploy bem-sucedido
- [ ] Domínio gerado
- [ ] Login funcionando

---

## 🆚 Railway vs Render

| Feature | Railway | Render |
|---------|---------|--------|
| Disco persistente | ✅ Grátis (1GB) | ❌ Pago |
| Sleep | ❌ Não dorme | ✅ Dorme após 15min |
| Setup | ⚡ Muito fácil | ⚡ Fácil |
| Preço | $5 créditos/mês | $0 (com limitações) |

**Recomendação:** Use Railway se não quer pagar! 🚂

---

## 🔗 Links Úteis

- Dashboard: https://railway.app/dashboard
- Documentação: https://docs.railway.app
- Status: https://railway.app/status

---

## ✅ Pronto!

Sua aplicação está rodando 24/7 com banco de dados persistente, tudo de graça (nos créditos mensais)! 🎉

Qualquer problema, consulte os logs ou a documentação oficial do Railway.
