import { DatabaseSync } from 'node:sqlite'; // built into Node 22.13+, so no native build step
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  email         TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS leads (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  phone      TEXT    NOT NULL DEFAULT '',
  company    TEXT    NOT NULL DEFAULT '',
  source     TEXT    NOT NULL,
  status     TEXT    NOT NULL DEFAULT 'New'
             CHECK (status IN ('New', 'Contacted', 'Qualified', 'Lost')),
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Every query is scoped to a user, then filtered/sorted by status or date.
CREATE INDEX IF NOT EXISTS idx_leads_user_status  ON leads (user_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_user_created ON leads (user_id, created_at DESC);
`;

export function openDb(file = process.env.DB_PATH || './data/leads.db') {
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA);
  return db;
}