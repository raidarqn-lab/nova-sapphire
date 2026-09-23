import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
export function openDatabase(path=process.env.DB_PATH||'./data/nova.sqlite'){
 mkdirSync(dirname(path),{recursive:true});const db=new DatabaseSync(path);db.exec(`
 PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
 CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, username TEXT NOT NULL COLLATE NOCASE UNIQUE, password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('member','officer','admin')), active INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS invitations(hash TEXT PRIMARY KEY,role TEXT NOT NULL CHECK(role IN ('member','officer','admin')),expires_at INTEGER NOT NULL,used_at INTEGER,created_by INTEGER REFERENCES users(id));
 CREATE TABLE IF NOT EXISTS sessions(hash TEXT PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id),csrf TEXT NOT NULL,expires_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS recovery_codes(hash TEXT PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id));
 CREATE TABLE IF NOT EXISTS rate_limits(key TEXT PRIMARY KEY,attempts INTEGER NOT NULL,expires_at INTEGER NOT NULL);
 `);return db;
}
export function transaction(db,fn){db.exec('BEGIN IMMEDIATE');try{const result=fn();db.exec('COMMIT');return result}catch(e){db.exec('ROLLBACK');throw e}}
