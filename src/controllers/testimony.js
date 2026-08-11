// Logique métier des témoignages.
import { randomUUID } from 'node:crypto';
import db from '../../db/db.js';

const PAGE_SIZE = 20;
const STATES = ['draft', 'published', 'archived'];

const insertTestimony = db.prepare(
  'INSERT INTO testimonies (id, data) VALUES (?, ?)'
);
const countTotal = db.prepare('SELECT COUNT(*) AS n FROM testimonies');
const countByState = db.prepare(
  'SELECT state, COUNT(*) AS n FROM testimonies GROUP BY state'
);
const countWeek = db.prepare(
  "SELECT COUNT(*) AS n FROM testimonies WHERE created_at >= datetime('now', '-7 days')"
);
const listAll = db.prepare(
  'SELECT id, data, state, created_at FROM testimonies ORDER BY created_at DESC LIMIT ? OFFSET ?'
);
const listByState = db.prepare(
  'SELECT id, data, state, created_at FROM testimonies WHERE state = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
);
const countState = db.prepare(
  'SELECT COUNT(*) AS n FROM testimonies WHERE state = ?'
);

// Enregistre un témoignage (état 'draft' par défaut). Renvoie son id.
export function createTestimony(data) {
  const id = randomUUID();
  insertTestimony.run(id, JSON.stringify(data));
  return id;
}

// Compteurs pour le tableau de bord.
export function getCounters() {
  const byState = { draft: 0, published: 0, archived: 0 };
  for (const row of countByState.all()) byState[row.state] = row.n;
  return { total: countTotal.get().n, byState, week: countWeek.get().n };
}

// Extrait les N premiers mots d'un texte, avec ellipse si tronqué.
function excerpt(text, wordCount) {
  const words = String(text ?? '').trim().split(/\s+/).filter(Boolean);
  const slice = words.slice(0, wordCount).join(' ');
  return words.length > wordCount ? `${slice}…` : slice;
}

// Liste paginée, filtrable par état. state doit être validé par l'appelant.
export function listTestimonies({ page = 1, state = null } = {}) {
  const offset = (page - 1) * PAGE_SIZE;
  const rows = state
    ? listByState.all(state, PAGE_SIZE, offset)
    : listAll.all(PAGE_SIZE, offset);
  const total = state ? countState.get(state).n : countTotal.get().n;

  const items = rows.map((row) => {
    const data = JSON.parse(row.data);
    return {
      id: row.id,
      state: row.state,
      date: row.created_at.slice(0, 10),
      excerpt: excerpt(data.testimony, 30)
    };
  });

  return {
    items,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE))
  };
}

export { STATES };