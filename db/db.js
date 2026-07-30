// Singleton better-sqlite3 : une seule connexion pour toute l'application.
import Database from 'better-sqlite3';
import { config } from '../src/config.js';

const db = new Database(config.dbPath);

// WAL : lectures et écritures concurrentes plus sûres pour un serveur web.
db.pragma('journal_mode = WAL');
// Active le respect des clés étrangères (désactivé par défaut dans SQLite).
db.pragma('foreign_keys = ON');

export default db;