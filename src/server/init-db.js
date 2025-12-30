import 'dotenv/config';
import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../..', 'biblia.db');

// Criar diretório se não existir (para ambientes de produção)
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`📁 Diretório criado: ${dbDir}`);
}

const db = new Database(dbPath);
console.log(`📊 Banco de dados: ${dbPath}`);

// Criar tabelas
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS progresso (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    dia INTEGER NOT NULL,
    concluido INTEGER DEFAULT 0,
    data_conclusao DATETIME,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, dia)
  );

  CREATE TABLE IF NOT EXISTS conquistas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    conquista_id TEXT NOT NULL,
    desbloqueada_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, conquista_id)
  );

  CREATE INDEX IF NOT EXISTS idx_progresso_usuario ON progresso(usuario_id);
  CREATE INDEX IF NOT EXISTS idx_conquistas_usuario ON conquistas(usuario_id);
`);

// Criar usuário admin padrão
const senhaAdmin = 'Cristomesalvou@123##';
const senhaHash = bcrypt.hashSync(senhaAdmin, 10);

const stmt = db.prepare(`
  INSERT OR IGNORE INTO usuarios (nome, username, senha_hash, is_admin)
  VALUES (?, ?, ?, 1)
`);

try {
  stmt.run('Administrador', 'admin', senhaHash);
  console.log('✅ Banco de dados inicializado!');
  console.log('📝 Usuário admin criado:');
  console.log('   Username: admin');
  console.log('   Senha: Cristomesalvou@123##');
  console.log('⚠️  IMPORTANTE: Troque a senha do admin após o primeiro login!');
} catch (err) {
  console.log('ℹ️  Banco de dados já existe');
}

db.close();
