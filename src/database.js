import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'bot.db');

// Ensure data directory exists
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);

// Enable WAL mode for better performance
db.exec('PRAGMA journal_mode = WAL;');

// ─── Schema ────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS guild_config (
    guild_id TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT,
    PRIMARY KEY (guild_id, key)
  );

  CREATE TABLE IF NOT EXISTS warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    timestamp INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS anti_spam (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    message_count INTEGER DEFAULT 0,
    last_reset INTEGER DEFAULT 0,
    PRIMARY KEY (guild_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS anti_nuke (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    count INTEGER DEFAULT 0,
    last_reset INTEGER DEFAULT 0,
    PRIMARY KEY (guild_id, user_id, action)
  );
`);

// ─── Guild Config ──────────────────────────────────────────────────────────

export function getConfig(guildId, key) {
  const stmt = db.prepare('SELECT value FROM guild_config WHERE guild_id = ? AND key = ?');
  const row = stmt.get(guildId, key);
  return row ? row.value : null;
}

export function setConfig(guildId, key, value) {
  db.prepare('INSERT OR REPLACE INTO guild_config (guild_id, key, value) VALUES (?, ?, ?)').run(guildId, key, value);
}

// ─── Warnings ──────────────────────────────────────────────────────────────

export function addWarning(guildId, userId, moderatorId, reason) {
  return db.prepare('INSERT INTO warnings (guild_id, user_id, moderator_id, reason, timestamp) VALUES (?, ?, ?, ?, ?)').run(guildId, userId, moderatorId, reason, Date.now());
}

export function getWarnings(guildId, userId) {
  return db.prepare('SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY timestamp DESC').all(guildId, userId);
}

export function clearWarnings(guildId, userId) {
  return db.prepare('DELETE FROM warnings WHERE guild_id = ? AND user_id = ?').run(guildId, userId);
}

// ─── Anti-Spam ─────────────────────────────────────────────────────────────

export function getSpamData(guildId, userId) {
  return db.prepare('SELECT * FROM anti_spam WHERE guild_id = ? AND user_id = ?').get(guildId, userId);
}

export function upsertSpamData(guildId, userId, count, lastReset) {
  db.prepare('INSERT OR REPLACE INTO anti_spam (guild_id, user_id, message_count, last_reset) VALUES (?, ?, ?, ?)').run(guildId, userId, count, lastReset);
}

// ─── Anti-Nuke ─────────────────────────────────────────────────────────────

export function getNukeData(guildId, userId, action) {
  return db.prepare('SELECT * FROM anti_nuke WHERE guild_id = ? AND user_id = ? AND action = ?').get(guildId, userId, action);
}

export function upsertNukeData(guildId, userId, action, count, lastReset) {
  db.prepare('INSERT OR REPLACE INTO anti_nuke (guild_id, user_id, action, count, last_reset) VALUES (?, ?, ?, ?, ?)').run(guildId, userId, action, count, lastReset);
}

export default db;
