# Changelog

Todas as mudanças notáveis neste projeto serão documentadas aqui.

## [2.0.0] - 2025-12-29

### Adicionado
- ✨ Sistema completo de autenticação multi-usuário
- ✨ Painel administrativo para gerenciar usuários
- ✨ Banco de dados SQLite com suporte para 50+ usuários
- ✨ API REST para gerenciamento de usuários e progresso
- ✨ Cada usuário tem seu próprio progresso independente
- ✨ Admin pode visualizar e acompanhar o progresso de todos os usuários
- ✨ Sistema de sessões seguro com cookies httpOnly
- ✨ Senhas criptografadas com bcrypt
- ✨ Tela de login responsiva e elegante
- ✨ Painel admin com estatísticas e gestão completa
- ✨ Botão de logout em todas as páginas
- ✨ Nome do usuário exibido durante toda a navegação
- ✨ Proteção contra SQL injection e XSS
- ✨ Service Worker atualizado para não cachear APIs
- ✨ Documentação completa de instalação e deploy
- ✨ Script de início rápido (start.sh)
- ✨ Suporte para múltiplas plataformas de deploy

### Modificado
- 🔄 final.html agora integra com API via api-client.js
- 🔄 Progresso salvo no banco de dados ao invés de localStorage
- 🔄 Conquistas sincronizadas com o servidor
- 🔄 Service Worker atualizado para v2.0.0
- 🔄 Rotas protegidas por autenticação

### Técnico
- Node.js + Express backend
- SQLite database (better-sqlite3)
- bcrypt para hash de senhas
- express-session para gestão de sessões
- cookie-parser para cookies seguros
- Prepared statements para segurança SQL

## [1.0.0] - 2025-12-29

### Versão Inicial
- 📖 Plano de leitura bíblica completo (365 dias)
- 📊 Sistema de progresso com localStorage
- 🏆 Sistema de conquistas
- 📅 Calendário heatmap de atividades
- 📱 Progressive Web App (PWA)
- 🎨 Interface elegante com tema pergaminho
- 📱 Totalmente responsivo
- 🌐 Funciona offline
