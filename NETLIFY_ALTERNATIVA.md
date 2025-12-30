# ⚠️ Deploy no Netlify (NÃO RECOMENDADO)

## Por que NÃO usar Netlify?

A aplicação atual é um **servidor Express** com **SQLite**, incompatível com Netlify que é para sites estáticos.

## Se MESMO ASSIM quiser usar Netlify:

Você precisaria **reescrever completamente** a aplicação para:

### Opção 1: Netlify Functions (COMPLEXO)
- Converter todas as rotas Express para Netlify Functions
- Usar Netlify Blobs ou FaunaDB em vez de SQLite
- Reescrever gerenciamento de sessões
- **Tempo estimado**: 20-30 horas de trabalho

### Opção 2: Frontend Estático + Backend Separado
- Hospedar HTML/CSS/JS no Netlify (grátis)
- Hospedar API Node.js no Render (grátis)
- Configurar CORS
- **Tempo estimado**: 5-10 horas de trabalho

---

## 🎯 RECOMENDAÇÃO FORTE

**NÃO use Netlify para esta aplicação.**

Use **Render** conforme o guia em `DEPLOY_PRODUCAO.md`:
- ✅ Deploy em 10 minutos
- ✅ Zero alterações no código
- ✅ Gratuito
- ✅ Funciona perfeitamente

---

## Netlify é ótimo para:
- Sites HTML estáticos
- React/Vue/Angular (sem backend)
- JAMstack (APIs de terceiros)

## Netlify NÃO é ideal para:
- ❌ Servidores Express
- ❌ Bancos de dados em arquivo (SQLite)
- ❌ Sessions baseadas em servidor
- ❌ Nossa aplicação atual

---

**Conclusão**: Siga o `DEPLOY_PRODUCAO.md` e use o Render.
