import express from 'express';
import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '../..');
const publicDir = path.join(__dirname, '../public');

const app = express();
const db = new Database(path.join(rootDir, 'biblia.db'));
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'biblia-secret-2025-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction, // true em produção com HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    sameSite: 'strict'
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

// ==================== ROTAS DE AUTENTICAÇÃO ====================

// Login
app.post('/api/login', (req, res) => {
  const { username, senha } = req.body;

  const usuario = db.prepare('SELECT * FROM usuarios WHERE username = ?').get(username);

  if (!usuario || !bcrypt.compareSync(senha, usuario.senha_hash)) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  req.session.userId = usuario.id;
  req.session.isAdmin = usuario.is_admin === 1;
  req.session.nome = usuario.nome;

  res.json({
    success: true,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      username: usuario.username,
      isAdmin: usuario.is_admin === 1
    }
  });
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

  const usuario = db.prepare('SELECT id, nome, username, is_admin FROM usuarios WHERE id = ?')
    .get(req.session.userId);

  if (!usuario) {
    req.session.destroy();
    return res.json({ autenticado: false });
  }

  res.json({
    autenticado: true,
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

// Criar usuário
app.post('/api/usuarios', requireAdmin, (req, res) => {
  const { nome, username, senha } = req.body;

  if (!nome || !username || !senha) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  const senhaHash = bcrypt.hashSync(senha, 10);

  try {
    const result = db.prepare(`
      INSERT INTO usuarios (nome, username, senha_hash, is_admin)
      VALUES (?, ?, ?, 0)
    `).run(nome, username, senhaHash);

    res.json({ success: true, id: result.lastInsertRowid });
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
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(usuario_id, dia)
    DO UPDATE SET concluido = ?, data_conclusao = datetime('now')
  `);

  stmt.run(req.session.userId, dia, concluido ? 1 : 0, concluido ? 1 : 0);
  res.json({ success: true });
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
