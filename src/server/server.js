import 'dotenv/config';
import express from 'express';
import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import SqliteStore from 'better-sqlite3-session-store';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Configurar fuso horário para America/Sao_Paulo
process.env.TZ = 'America/Sao_Paulo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '../..');
const publicDir = path.join(__dirname, '../public');

const app = express();
const dbPath = process.env.DATABASE_PATH || path.join(rootDir, 'biblia.db');

// Verificar se o diretório existe e criar se necessário
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`📁 Diretório criado: ${dbDir}`);
}

console.log(`📊 Conectando ao banco: ${dbPath}`);
console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV}`);

const db = new Database(dbPath);
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Verificar se o banco tem dados (após inicialização)
try {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM usuarios').get();
  console.log(`👥 Usuários no banco: ${userCount.count}`);
} catch (error) {
  console.log('⚠️  Banco ainda não inicializado (será criado pelo init-db)');
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configurar session store
const SessionStore = SqliteStore(session);
app.use(session({
  store: new SessionStore({
    client: db,
    expired: {
      clear: true,
      intervalMs: 900000 // 15 minutos
    }
  }),
  secret: process.env.SESSION_SECRET || 'biblia-secret-2025-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction, // true em produção com HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    sameSite: isProduction ? 'strict' : 'lax'
  }
}));

// Servir arquivos estáticos
app.use(express.static(publicDir));
app.use('/assets', express.static(path.join(publicDir, 'assets')));

// Middleware de autenticação
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.userId || !req.session.isAdmin) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  next();
}

// ==================== RATE LIMITING DE LOGIN ====================
const loginAttempts = new Map(); // { username: { count: number, lastAttempt: Date, blockedUntil: Date } }
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutos
const RESET_WINDOW = 5 * 60 * 1000; // 5 minutos

function checkLoginAttempts(username) {
  const now = Date.now();
  const attempt = loginAttempts.get(username);

  if (!attempt) {
    return { allowed: true };
  }

  // Se está bloqueado
  if (attempt.blockedUntil && now < attempt.blockedUntil) {
    const minutesLeft = Math.ceil((attempt.blockedUntil - now) / 60000);
    return {
      allowed: false,
      message: `Muitas tentativas falhas. Tente novamente em ${minutesLeft} minuto(s).`
    };
  }

  // Resetar contador se passou o tempo da janela
  if (now - attempt.lastAttempt > RESET_WINDOW) {
    loginAttempts.delete(username);
    return { allowed: true };
  }

  return { allowed: true };
}

function registerFailedAttempt(username) {
  const now = Date.now();
  const attempt = loginAttempts.get(username) || { count: 0, lastAttempt: now };

  attempt.count++;
  attempt.lastAttempt = now;

  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.blockedUntil = now + BLOCK_DURATION;
    attempt.count = 0; // Resetar contador
  }

  loginAttempts.set(username, attempt);
}

function clearLoginAttempts(username) {
  loginAttempts.delete(username);
}

// Limpar tentativas antigas a cada 30 minutos
setInterval(() => {
  const now = Date.now();
  for (const [username, attempt] of loginAttempts.entries()) {
    if (attempt.blockedUntil && now > attempt.blockedUntil) {
      loginAttempts.delete(username);
    }
  }
}, 30 * 60 * 1000);

// ==================== ROTAS DE AUTENTICAÇÃO ====================

// Login
app.post('/api/login', (req, res) => {
  try {
    const { username, senha } = req.body;
    console.log(`🔐 Tentativa de login: ${username}`);

    if (!username || !senha) {
      console.log('❌ Username ou senha não fornecidos');
      return res.status(400).json({ error: 'Username e senha são obrigatórios' });
    }

    // Verificar rate limiting
    const attemptCheck = checkLoginAttempts(username);
    if (!attemptCheck.allowed) {
      console.log(`🚫 Login bloqueado por rate limiting: ${username}`);
      return res.status(429).json({ error: attemptCheck.message });
    }

    const usuario = db.prepare('SELECT * FROM usuarios WHERE username = ?').get(username);
    console.log(`👤 Usuário encontrado: ${usuario ? 'Sim' : 'Não'}`);

    if (!usuario) {
      console.log('❌ Usuário não encontrado no banco');
      registerFailedAttempt(username);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const senhaValida = bcrypt.compareSync(senha, usuario.senha_hash);
    console.log(`🔑 Senha válida: ${senhaValida ? 'Sim' : 'Não'}`);

    if (!senhaValida) {
      console.log('❌ Senha incorreta');
      registerFailedAttempt(username);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Login bem-sucedido - limpar tentativas
    clearLoginAttempts(username);

    req.session.userId = usuario.id;
    req.session.isAdmin = usuario.is_admin === 1;
    req.session.nome = usuario.nome;

    console.log(`✅ Login bem-sucedido: ${usuario.nome} (${usuario.username})`);
    console.log(`🔧 Session ID: ${req.sessionID}`);

    if (usuario.deve_trocar_senha === 1) {
      console.log('⚠️  Usuário deve trocar senha no primeiro login');
    }

    res.json({
      success: true,
      deveTrocarSenha: usuario.deve_trocar_senha === 1,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        username: usuario.username,
        isAdmin: usuario.is_admin === 1
      }
    });
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Verificar sessão
app.get('/api/session', (req, res) => {
  if (!req.session.userId) {
    return res.json({ autenticado: false });
  }

  const usuario = db.prepare('SELECT id, nome, username, is_admin, deve_trocar_senha FROM usuarios WHERE id = ?')
    .get(req.session.userId);

  if (!usuario) {
    req.session.destroy();
    return res.json({ autenticado: false });
  }

  res.json({
    autenticado: true,
    deveTrocarSenha: usuario.deve_trocar_senha === 1,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      username: usuario.username,
      isAdmin: usuario.is_admin === 1
    }
  });
});

// ==================== ROTAS DE USUÁRIOS (ADMIN) ====================

// Listar todos os usuários
app.get('/api/usuarios', requireAdmin, (req, res) => {
  const usuarios = db.prepare(`
    SELECT id, nome, username, is_admin, criado_em FROM usuarios ORDER BY nome
  `).all();

  res.json(usuarios);
});

// Validação de senha forte
function validarSenhaForte(senha) {
  if (senha.length < 8) {
    return { valida: false, erro: 'A senha deve ter no mínimo 8 caracteres' };
  }

  const temCaractereEspecial = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/'`~]/.test(senha);
  if (!temCaractereEspecial) {
    return { valida: false, erro: 'A senha deve conter pelo menos um caractere especial (!@#$%&*...)' };
  }

  return { valida: true };
}

// Criar usuário
app.post('/api/usuarios', requireAdmin, (req, res) => {
  const { nome, username } = req.body;

  if (!nome || !username) {
    return res.status(400).json({ error: 'Nome e username são obrigatórios' });
  }

  // Senha padrão para novos usuários
  const senhaPadrao = 'biblia1234';
  const senhaHash = bcrypt.hashSync(senhaPadrao, 10);

  try {
    const result = db.prepare(`
      INSERT INTO usuarios (nome, username, senha_hash, is_admin, deve_trocar_senha)
      VALUES (?, ?, ?, 0, 1)
    `).run(nome, username, senhaHash);

    console.log(`✅ Usuário criado: ${username} (deve trocar senha no primeiro login)`);
    res.json({
      success: true,
      id: result.lastInsertRowid,
      senhaPadrao: senhaPadrao // Retornar para o admin informar ao usuário
    });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      res.status(400).json({ error: 'Nome de usuário já existe' });
    } else {
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }
});

// Trocar senha
app.post('/api/usuarios/:id/senha', requireAdmin, (req, res) => {
  const { novaSenha } = req.body;
  const userId = parseInt(req.params.id);

  if (!novaSenha) {
    return res.status(400).json({ error: 'Nova senha não informada' });
  }

  const senhaHash = bcrypt.hashSync(novaSenha, 10);

  db.prepare('UPDATE usuarios SET senha_hash = ? WHERE id = ?')
    .run(senhaHash, userId);

  res.json({ success: true });
});

// Trocar própria senha (requer senha atual)
app.post('/api/usuarios/minha-senha', requireAuth, (req, res) => {
  const { senhaAtual, novaSenha } = req.body;

  if (!senhaAtual || !novaSenha) {
    return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
  }

  // Validar senha forte
  const validacao = validarSenhaForte(novaSenha);
  if (!validacao.valida) {
    return res.status(400).json({ error: validacao.erro });
  }

  // Buscar usuário atual
  const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.session.userId);

  if (!usuario) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  // Verificar senha atual
  if (!bcrypt.compareSync(senhaAtual, usuario.senha_hash)) {
    return res.status(401).json({ error: 'Senha atual incorreta' });
  }

  // Atualizar senha e resetar flag de trocar senha
  const senhaHash = bcrypt.hashSync(novaSenha, 10);
  db.prepare('UPDATE usuarios SET senha_hash = ?, deve_trocar_senha = 0 WHERE id = ?')
    .run(senhaHash, req.session.userId);

  console.log(`✅ Senha alterada: ${usuario.username}`);
  res.json({ success: true });
});

// Deletar usuário
app.delete('/api/usuarios/:id', requireAdmin, (req, res) => {
  const userId = parseInt(req.params.id);

  // Não permitir deletar o próprio usuário
  if (userId === req.session.userId) {
    return res.status(400).json({ error: 'Não é possível deletar seu próprio usuário' });
  }

  db.prepare('DELETE FROM usuarios WHERE id = ?').run(userId);
  res.json({ success: true });
});

// ==================== ROTAS DE PROGRESSO ====================

// Obter progresso do usuário
app.get('/api/progresso', requireAuth, (req, res) => {
  const progresso = db.prepare(`
    SELECT dia, concluido, data_conclusao
    FROM progresso
    WHERE usuario_id = ?
    ORDER BY dia
  `).all(req.session.userId);

  res.json(progresso);
});

// Salvar progresso
app.post('/api/progresso', requireAuth, (req, res) => {
  const { dia, concluido } = req.body;

  const stmt = db.prepare(`
    INSERT INTO progresso (usuario_id, dia, concluido, data_conclusao)
    VALUES (?, ?, ?, datetime('now', 'localtime'))
    ON CONFLICT(usuario_id, dia)
    DO UPDATE SET concluido = ?, data_conclusao = datetime('now', 'localtime')
  `);

  stmt.run(req.session.userId, dia, concluido ? 1 : 0, concluido ? 1 : 0);
  res.json({ success: true });
});

// Limpar todo progresso do usuário (Novo Ciclo)
app.post('/api/progresso/limpar', requireAuth, (req, res) => {
  try {
    console.log(`🔄 Limpando progresso do usuário: ${req.session.userId}`);

    // Deletar progresso
    db.prepare('DELETE FROM progresso WHERE usuario_id = ?').run(req.session.userId);

    // Deletar conquistas
    db.prepare('DELETE FROM conquistas WHERE usuario_id = ?').run(req.session.userId);

    console.log('✅ Progresso e conquistas limpos com sucesso');
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao limpar progresso:', error);
    res.status(500).json({ error: 'Erro ao limpar progresso' });
  }
});

// Obter progresso de todos os usuários (ADMIN)
app.get('/api/progresso/todos', requireAdmin, (req, res) => {
  const progressos = db.prepare(`
    SELECT
      u.id,
      u.nome,
      u.username,
      COUNT(CASE WHEN p.concluido = 1 THEN 1 END) as dias_concluidos,
      MAX(p.data_conclusao) as ultima_leitura
    FROM usuarios u
    LEFT JOIN progresso p ON u.id = p.usuario_id
    WHERE u.is_admin = 0
    GROUP BY u.id
    ORDER BY dias_concluidos DESC, u.nome
  `).all();

  res.json(progressos);
});

// Obter progresso detalhado de um usuário (ADMIN)
app.get('/api/progresso/usuario/:id', requireAdmin, (req, res) => {
  const userId = parseInt(req.params.id);

  const progresso = db.prepare(`
    SELECT dia, concluido, data_conclusao
    FROM progresso
    WHERE usuario_id = ?
    ORDER BY dia
  `).all(userId);

  const usuario = db.prepare('SELECT nome, username FROM usuarios WHERE id = ?').get(userId);

  res.json({ usuario, progresso });
});

// Admin pode editar progresso de um usuário
app.post('/api/admin/progresso/:userId', requireAdmin, (req, res) => {
  const userId = parseInt(req.params.userId);
  const { dia, concluido } = req.body;

  const stmt = db.prepare(`
    INSERT INTO progresso (usuario_id, dia, concluido, data_conclusao)
    VALUES (?, ?, ?, datetime('now', 'localtime'))
    ON CONFLICT(usuario_id, dia)
    DO UPDATE SET concluido = ?, data_conclusao = datetime('now', 'localtime')
  `);

  stmt.run(userId, dia, concluido ? 1 : 0, concluido ? 1 : 0);
  res.json({ success: true });
});

// ==================== ROTAS DE CONQUISTAS ====================

// Obter conquistas do usuário
app.get('/api/conquistas', requireAuth, (req, res) => {
  const conquistas = db.prepare(`
    SELECT conquista_id, desbloqueada_em
    FROM conquistas
    WHERE usuario_id = ?
  `).all(req.session.userId);

  res.json(conquistas.map(c => c.conquista_id));
});

// Salvar conquista
app.post('/api/conquistas', requireAuth, (req, res) => {
  const { conquistaId } = req.body;

  try {
    db.prepare(`
      INSERT OR IGNORE INTO conquistas (usuario_id, conquista_id)
      VALUES (?, ?)
    `).run(req.session.userId, conquistaId);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar conquista' });
  }
});

// ==================== ROTAS DE PÁGINAS ====================

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'views', 'login.html'));
});

app.get('/app', requireAuth, (req, res) => {
  res.sendFile(path.join(publicDir, 'views', 'final.html'));
});

app.get('/admin', requireAdmin, (req, res) => {
  res.sendFile(path.join(publicDir, 'views', 'admin.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📖 Acesse http://localhost:${PORT} para fazer login`);
});
