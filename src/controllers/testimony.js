// Logique métier des témoignages.
import { randomUUID } from 'node:crypto';
import db from '../../db/db.js';

const PAGE_SIZE = 20;
const STATES = ['draft', 'to_review', 'to_delete', 'published', 'archived'];
// États atteignables manuellement par tout rôle (hors publication Osuny et suppression dure).
const OPEN_STATES = ['draft', 'to_review', 'to_delete', 'archived'];
const STATE_LABELS = {
  draft: 'Brouillon',
  to_review: 'À valider',
  to_delete: 'À supprimer',
  published: 'Publié',
  archived: 'Archivé'
};

const insertTestimony = db.prepare('INSERT INTO testimonies (id, data) VALUES (?, ?)');
const selectOne = db.prepare(
  'SELECT id, data, state, published_on_osuny, created_at FROM testimonies WHERE id = ?'
);
const selectState = db.prepare('SELECT state FROM testimonies WHERE id = ?');
const updateState = db.prepare('UPDATE testimonies SET state = ? WHERE id = ?');
const deleteOne = db.prepare('DELETE FROM testimonies WHERE id = ?');
const insertEvent = db.prepare(
  `INSERT INTO testimony_events (id, testimony_id, from_state, to_state, user_id, user_name, note)
   VALUES (?, ?, ?, ?, ?, ?, ?)`
);
const selectEvents = db.prepare(
  `SELECT from_state, to_state, user_name, note, created_at
   FROM testimony_events WHERE testimony_id = ? ORDER BY created_at DESC, id DESC`
);
const countTotal = db.prepare('SELECT COUNT(*) AS n FROM testimonies');
const countByState = db.prepare('SELECT state, COUNT(*) AS n FROM testimonies GROUP BY state');
const countWeek = db.prepare(
  "SELECT COUNT(*) AS n FROM testimonies WHERE created_at >= datetime('now', '-7 days')"
);
const listAll = db.prepare(
  'SELECT id, data, state, created_at FROM testimonies ORDER BY created_at DESC LIMIT ? OFFSET ?'
);
const listByState = db.prepare(
  'SELECT id, data, state, created_at FROM testimonies WHERE state = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
);
const countState = db.prepare('SELECT COUNT(*) AS n FROM testimonies WHERE state = ?');

// Enregistre un témoignage (état 'draft' par défaut). Renvoie son id.
export function createTestimony(data) {
  const id = randomUUID();
  insertTestimony.run(id, JSON.stringify(data));
  return id;
}

// Lit un témoignage complet. Renvoie null si introuvable.
export function getTestimony(id) {
  const row = selectOne.get(id);
  if (!row) return null;
  return {
    id: row.id,
    state: row.state,
    stateLabel: STATE_LABELS[row.state] ?? row.state,
    publishedOnOsuny: row.published_on_osuny === 1,
    date: row.created_at.slice(0, 16).replace('T', ' '),
    data: JSON.parse(row.data)
  };
}

// Change l'état d'un témoignage et journalise la transition (qui, quand, motif).
const applyStateChange = db.transaction((id, toState, user, note) => {
  const row = selectState.get(id);
  if (!row) return { ok: false, reason: 'not_found' };
  const from = row.state;
  updateState.run(toState, id);
  insertEvent.run(
    randomUUID(), id, from, toState,
    user?.id ?? null, user?.name ?? null,
    note && note.trim() ? note.trim() : null
  );
  return { ok: true, from, to: toState };
});

export function changeState({ id, toState, user, note }) {
  if (!OPEN_STATES.includes(toState)) return { ok: false, reason: 'invalid_state' };
  return applyStateChange(id, toState, user, note);
}

// Supprime définitivement un témoignage (le journal est effacé en cascade).
export function deleteTestimony(id) {
  return deleteOne.run(id).changes > 0;
}

// Historique des transitions, du plus récent au plus ancien.
export function getEvents(id) {
  return selectEvents.all(id).map((e) => ({
    fromLabel: STATE_LABELS[e.from_state] ?? e.from_state ?? '—',
    toLabel: STATE_LABELS[e.to_state] ?? e.to_state,
    by: e.user_name,
    note: e.note,
    date: e.created_at.slice(0, 16).replace('T', ' ')
  }));
}

// Compteurs pour le tableau de bord.
export function getCounters() {
  const byState = { draft: 0, to_review: 0, to_delete: 0, published: 0, archived: 0 };
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
      stateLabel: STATE_LABELS[row.state] ?? row.state,
      date: row.created_at.slice(0, 10),
      excerpt: excerpt(data.testimony, 30)
    };
  });

  return { items, total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export { STATES, OPEN_STATES, STATE_LABELS };