// Applique les migrations SQL manquantes, dans l'ordre des noms de fichiers.
// Chaque migration n'est jouée qu'une fois ; la trace est gardée dans _migrations.
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import db from './db.js';

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(here, 'migrations');

export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const applied = new Set(
    db.prepare('SELECT name FROM _migrations').all().map((row) => row.name)
  );

  const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
  const insert = db.prepare('INSERT INTO _migrations (name) VALUES (?)');

  let count = 0;
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = readFileSync(join(migrationsDir, file), 'utf8');
    // Transaction : soit la migration passe entièrement, soit rien n'est écrit.
    db.transaction(() => {
      db.exec(sql);
      insert.run(file);
    })();
    count += 1;
  }
  return { applied: count, total: files.length };
}

// Permet de lancer les migrations en ligne de commande : `npm run migrate`.
if (import.meta.url === `file://${process.argv[1]}`) {
  const result = migrate();
  process.stdout.write(`Migrations appliquées : ${result.applied} / ${result.total}\n`);
}