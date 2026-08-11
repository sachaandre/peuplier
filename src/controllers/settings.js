// Lecture des réglages de l'instance (table settings).
import db from '../../db/db.js';

const selectAll = db.prepare('SELECT key, value FROM settings');

// Renvoie tous les réglages sous forme d'objet { key: value }.
export function getSettings() {
  return Object.fromEntries(selectAll.all().map((row) => [row.key, row.value]));
}