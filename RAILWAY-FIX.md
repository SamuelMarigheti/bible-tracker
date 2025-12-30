# 🔧 Correção - Railway Deploy

## ⚠️ Problema encontrado

O Railway estava usando o path errado do banco e não inicializava as tabelas.

## ✅ Correções aplicadas

1. **Script de start atualizado**: Agora executa `init-db` antes de iniciar o servidor
2. **Verificação protegida**: Server.js não quebra se tabelas não existirem
3. **Path correto**: Use `/app/data/biblia.db` no Railway

---

## 🔧 IMPORTANTE - Configure no Railway

### 1️⃣ Atualizar variável de ambiente

No Railway dashboard:
1. Clique no seu projeto
2. Vá em **Variables**
3. **MUDE** a variável `DATABASE_PATH`:

   **DE:**
   ```
   DATABASE_PATH=/opt/render/project/data/biblia.db
   ```

   **PARA:**
   ```
   DATABASE_PATH=/app/data/biblia.db
   ```

4. Clique em **Save** ou **Deploy**

### 2️⃣ Verificar Volume

Em **Settings** → **Volumes**:
- Mount Path: `/app/data` ✅
- Se não existir, crie agora!

### 3️⃣ Redeploy

1. Faça push do código atualizado (commit já feito)
2. Ou clique em **Deploy** → **Redeploy** no Railway

---

## 📊 Logs esperados após correção

Você deve ver esta sequência:

```
> biblia-leitura-tracker@2.0.0 start
> npm run init-db && node src/server/server.js

> biblia-leitura-tracker@2.0.0 init-db
> node src/server/init-db.js

📁 Diretório criado: /app/data (ou já existe)
📊 Banco de dados: /app/data/biblia.db
✅ Banco de dados inicializado!
📝 Usuário admin criado:
   Username: admin
   Senha: Cristomesalvou@123##

📊 Conectando ao banco: /app/data/biblia.db
🔧 NODE_ENV: production
👥 Usuários no banco: 1
🚀 Servidor rodando em http://localhost:3000
```

---

## 🐛 Se ainda der erro

### Erro: "ENOENT: no such file or directory"

**Solução:** O volume não foi criado
1. Settings → Volumes → Add Volume
2. Mount Path: `/app/data`
3. Redeploy

### Erro: "Permission denied"

**Solução:** Railway não tem permissão para criar arquivos
- Isso é RARO no Railway
- Tente remover e recriar o volume

### Erro: "Module not found"

**Solução:** Dependências não instaladas
1. Verifique `package.json` e `package-lock.json` commitados
2. Clear build cache no Railway
3. Redeploy

---

## ✅ Teste final

Após deploy bem-sucedido:

1. Acesse a URL do Railway
2. Faça login:
   - **Usuário:** `admin`
   - **Senha:** `Cristomesalvou@123##`
3. ✅ Deve funcionar!

---

## 🎯 Próximos passos

Depois de funcionar:
1. **Troque a senha do admin** (Settings → Alterar Senha)
2. **Crie outros usuários** (Painel Admin)
3. **Teste a leitura bíblica**

Pronto! 🎉
