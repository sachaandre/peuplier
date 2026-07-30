// Fabrique de l'application : construit et configure Fastify, sans le démarrer.
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyFormbody from '@fastify/formbody';
import fastifyView from '@fastify/view';
import { Eta } from 'eta';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { config } from './config.js';

const here = dirname(fileURLToPath(import.meta.url));
const rootDir = join(here, '..');
const viewsDir = join(rootDir, 'views');
const publicDir = join(rootDir, 'public');

export async function buildApp() {
  const app = Fastify({ logger: true });

  // Parse les corps de formulaire (application/x-www-form-urlencoded).
  await app.register(fastifyFormbody);

  // Moteur de templates eta.
  await app.register(fastifyView, {
    engine: { eta: new Eta({ views: viewsDir }) },
    root: viewsDir
  });

  // Fichiers statiques servis sous /public/ (jamais la base de données).
  await app.register(fastifyStatic, {
    root: publicDir,
    prefix: '/public/'
  });

  // En-têtes de sécurité posés sur chaque réponse.
  app.addHook('onSend', async (request, reply, payload) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    // La carte doit pouvoir s'embarquer en iframe : on n'y interdit pas le framing.
    const isEmbeddableMap =
      request.url.startsWith('/carte') && request.query?.iframe === '1';
    if (!isEmbeddableMap) {
      reply.header('X-Frame-Options', 'DENY');
    }
    return payload;
  });

  // Route d'accueil provisoire, remplacée par les vraies routes plus tard.
  app.get('/', (request, reply) => reply.view('home.eta', { title: 'Peuplier — accueil' }));

  return app;
}