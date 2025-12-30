# 🔧 Troubleshooting - Problemas Comuns

## ❌ Erro: "Acesso negado" ao fazer login

### Possíveis causas:

1. **Banco de dados não foi inicializado**
2. **Usuário admin não foi criado**
3. **Disco persistente não configurado corretamente**
4. **Problema com session store**

### Soluções:

#### 1. Verificar os logs do Render

No painel do Render:
1. Clique no seu serviço
2. Vá em **"Logs"**
3. Procure por:
   - `📊 Banco de dados: /opt/render/project/data/biblia.db`
   - `👥 Usuários no banco: X`
   - `✅ Banco de dados inicializado!`

#### 2. Se "Usuários no banco: 0"

O banco não foi inicializado! Faça:

1. No painel do Render, vá em **"Manual Deploy"**
2. Clique em **"Clear build cache & deploy"**
3. Isso vai forçar a execução do `npm run build` que inicializa o banco

#### 3. Verificar se o disco persistente existe

1. No painel do Render, vá em **"Disks"**
2. Deve existir um disco chamado `biblia-data`
3. Mount path: `/opt/render/project/data`

Se NÃO existir:
1. Clique em **"Add Disk"**
2. Name: `biblia-data`
3. Mount Path: `/opt/render/project/data`
4. Size: 1 GB
5. Clique em **"Save"**
6. Aguarde o redeploy automático

#### 4. Acessar o shell do Render (plano pago)

Se você tem o plano pago:
```bash
# Conectar via SSH
render ssh biblia-leitura-tracker

# Verificar se o banco existe
ls -la /opt/render/project/data/

# Ver conteúdo do banco
sqlite3 /opt/render/project/data/biblia.db "SELECT * FROM usuarios;"

# Criar usuário manualmente se necessário
sqlite3 /opt/render/project/data/biblia.db "INSERT INTO usuarios (nome, username, senha_hash, is_admin) VALUES ('Admin', 'admin', '\$2b\$10\$hashed_password', 1);"
```

---

## ⚠️ Warning: MemoryStore não é adequado para produção

**Status:** ✅ RESOLVIDO

Este warning foi corrigido! Agora usamos `better-sqlite3-session-store` que:
- Armazena sessions no SQLite
- Não vaza memória
- Escala corretamente

Se ainda aparecer este warning, certifique-se de que:
1. `better-sqlite3-session-store` está instalado
2. O código do `server.js` foi atualizado
3. O deploy foi feito com as últimas alterações

---

## 🐛 Logs de Debug

Quando você tentar fazer login, procure nos logs do Render:

```
🔐 Tentativa de login: admin
👤 Usuário encontrado: Sim/Não
🔑 Senha válida: Sim/Não
✅ Login bem-sucedido: Administrador (admin)
```

### Cenários possíveis:

#### Cenário 1: "Usuário encontrado: Não"
**Problema:** Banco vazio ou usuário não foi criado
**Solução:** Clear build cache & deploy

#### Cenário 2: "Senha válida: Não"
**Problema:** Senha errada
**Solução:** Use `Cristomesalvou@123##` (senha padrão)

#### Cenário 3: Login bem-sucedido mas depois "Acesso negado"
**Problema:** Session store não está funcionando
**Solução:**
1. Verificar se `better-sqlite3-session-store` foi instalado
2. Verificar logs de erro do session store
3. Limpar cookies do navegador

---

## 🔄 Forçar Rebuild Completo

Se nada funcionar:

1. No Render, vá em **"Settings"**
2. Role até **"Danger Zone"**
3. Clique em **"Suspend Service"**
4. Aguarde alguns segundos
5. Clique em **"Resume Service"**
6. Vá em **"Manual Deploy"**
7. Clique em **"Clear build cache & deploy"**

---

## 📞 Ainda com problemas?

### Verificar o ambiente local

Antes de fazer deploy, teste localmente:

```bash
# Limpar banco local
rm biblia.db

# Reinstalar dependências
npm install

# Inicializar banco
npm run build

# Rodar servidor
npm start

# Testar login em http://localhost:3000
# Usuário: admin
# Senha: Cristomesalvou@123##
```

Se funcionar localmente mas não no Render:
- O problema está na configuração do Render
- Verifique as variáveis de ambiente
- Verifique o disco persistente

---

## 🎯 Checklist Completo

- [ ] Disco persistente criado (`biblia-data`)
- [ ] Mount path correto (`/opt/render/project/data`)
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm start`
- [ ] Variável `DATABASE_PATH=/opt/render/project/data/biblia.db`
- [ ] Logs mostram "Usuários no banco: 1" (ou mais)
- [ ] `better-sqlite3-session-store` instalado
- [ ] Código atualizado e em produção

---

## 💡 Dica

Após corrigir, sempre:
1. Limpe o cache do navegador
2. Abra em aba anônima
3. Tente fazer login novamente

Isso evita problemas com cookies antigos!
