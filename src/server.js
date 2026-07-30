// Point d'entrée : applique les migrations, construit l'app, écoute le port.
import { config } from './config.js';
import { migrate } from '../db/migrate.js';
import { buildApp } from './app.js';

const result = migrate();

const app = await buildApp();
app.log.info(`Migrations appliquées : ${result.applied} / ${result.total}`);

try {
  await app.listen({ port: config.port, host: config.host });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}