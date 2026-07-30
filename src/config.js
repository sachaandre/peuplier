// Lecture et validation des variables d'environnement.
// L'application refuse de démarrer si une variable requise est absente.

const required = ['SESSION_SECRET'];
const missing = required.filter((k) => !process.env[k] || process.env[k].trim() === '');

if (missing.length > 0) {
  throw new Error(`Variables d'environnement manquantes : ${missing.join(', ')}`);
}

const env = process.env.NODE_ENV ?? 'development';
const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error(`PORT invalide : ${process.env.PORT}`);
}

// Export unique, gelé pour empêcher toute mutation accidentelle ailleurs dans le code.
export const config = Object.freeze({
  env,
  isProd: env === 'production',
  port,
  host: process.env.HOST ?? '0.0.0.0',
  sessionSecret: process.env.SESSION_SECRET,
  dbPath: process.env.DB_PATH ?? './db/peuplier.db'
});