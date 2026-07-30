// Logique métier des témoignages.
import { randomUUID } from 'node:crypto';
import db from '../../db/db.js';

const insertTestimony = db.prepare(
  'INSERT INTO testimonies (id, data) VALUES (?, ?)'
);

// Enregistre un témoignage (état 'draft' par défaut). Renvoie son id.
export function createTestimony(data) {
  const id = randomUUID();
  insertTestimony.run(id, JSON.stringify(data));
  return id;
}