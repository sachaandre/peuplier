// Lecture des champs (formulaire public) et logique du constructeur (admin).
import db from '../../db/db.js';

const FIELD_TYPES = ['text', 'textarea', 'number', 'email', 'tel', 'date', 'radio', 'checkbox', 'city'];
const FIELD_TYPE_LABELS = {
  text: 'Texte court', textarea: 'Texte long', number: 'Nombre', email: 'Email',
  tel: 'Téléphone', date: 'Date', radio: 'Choix unique', checkbox: 'Choix multiple', city: 'Ville'
};
const OSUNY_MAPPINGS = ['chapter', 'datatable'];
const OPTION_TYPES = ['radio', 'checkbox'];
const PROTECTED_ID = 'testimony';

const selectPublic = db.prepare(
  `SELECT id, label, field_type, required, private, options
   FROM form_fields ORDER BY position ASC, created_at ASC`
);
const selectAll = db.prepare(
  `SELECT id, label, field_type, required, private, position, options, osuny_block_mapping
   FROM form_fields ORDER BY position ASC, created_at ASC`
);
const selectById = db.prepare(
  `SELECT id, label, field_type, required, private, position, options, osuny_block_mapping
   FROM form_fields WHERE id = ?`
);
const selectIds = db.prepare('SELECT id FROM form_fields');
const selectMaxPos = db.prepare('SELECT COALESCE(MAX(position), -1) AS m FROM form_fields');
const insertField = db.prepare(
  `INSERT INTO form_fields (id, label, field_type, required, private, position, options, osuny_block_mapping)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
);
const updateFieldStmt = db.prepare(
  `UPDATE form_fields SET label = ?, field_type = ?, required = ?, private = ?, options = ?, osuny_block_mapping = ?
   WHERE id = ?`
);
const updatePosition = db.prepare('UPDATE form_fields SET position = ? WHERE id = ?');
const deleteFieldStmt = db.prepare('DELETE FROM form_fields WHERE id = ?');

// --- Formulaire public ---

export function getFields() {
  return selectPublic.all().map((f) => ({
    id: f.id, label: f.label, fieldType: f.field_type,
    required: f.required === 1, private: f.private === 1,
    options: f.options ? JSON.parse(f.options) : []
  }));
}

export function validateSubmission(fields, body) {
  const data = {};
  const errors = [];
  for (const field of fields) {
    const raw = body[field.id];
    const value = Array.isArray(raw) ? raw : raw ?? '';
    const isEmpty = Array.isArray(value) ? value.length === 0 : String(value).trim() === '';
    if (field.required && isEmpty) { errors.push({ id: field.id, label: field.label }); continue; }
    if (!isEmpty) data[field.id] = value;
  }
  return { valid: errors.length === 0, errors, data };
}

// --- Constructeur (admin) ---

function normalizeOptions(fieldType, rawOptions) {
  if (!OPTION_TYPES.includes(fieldType)) return null;
  const list = String(rawOptions ?? '').split('\n').map((s) => s.trim()).filter(Boolean);
  return list.length ? JSON.stringify(list) : null;
}

function normalizeMapping(mapping) {
  return OSUNY_MAPPINGS.includes(mapping) ? mapping : null;
}

function toView(f) {
  return {
    id: f.id, label: f.label, fieldType: f.field_type,
    fieldTypeLabel: FIELD_TYPE_LABELS[f.field_type] ?? f.field_type,
    required: f.required === 1, private: f.private === 1, position: f.position,
    options: f.options ? JSON.parse(f.options) : [],
    osunyMapping: f.osuny_block_mapping,
    protected: f.id === PROTECTED_ID,
    hasOptions: OPTION_TYPES.includes(f.field_type)
  };
}

export function listFields() {
  return selectAll.all().map(toView);
}

export function getField(id) {
  const f = selectById.get(id);
  return f ? toView(f) : null;
}

function slugify(s) {
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'champ';
}

function uniqueId(base) {
  const existing = new Set(selectIds.all().map((r) => r.id));
  if (!existing.has(base)) return base;
  let i = 2;
  while (existing.has(`${base}_${i}`)) i += 1;
  return `${base}_${i}`;
}

export function createField({ label, fieldType, required, isPrivate, options, osunyMapping }) {
  const cleanLabel = String(label ?? '').trim();
  if (!cleanLabel) return { ok: false, reason: 'label_required' };
  if (!FIELD_TYPES.includes(fieldType)) return { ok: false, reason: 'invalid_type' };
  const id = uniqueId(slugify(cleanLabel));
  const position = selectMaxPos.get().m + 1;
  insertField.run(
    id, cleanLabel, fieldType, required ? 1 : 0, isPrivate ? 1 : 0, position,
    normalizeOptions(fieldType, options), normalizeMapping(osunyMapping)
  );
  return { ok: true, id };
}

export function updateField(id, { label, fieldType, required, isPrivate, options, osunyMapping }) {
  const existing = selectById.get(id);
  if (!existing) return { ok: false, reason: 'not_found' };
  const isProtected = id === PROTECTED_ID;
  const cleanLabel = String(label ?? '').trim() || existing.label;
  // Le champ témoignage garde son type et reste obligatoire.
  const type = isProtected ? existing.field_type
    : (FIELD_TYPES.includes(fieldType) ? fieldType : existing.field_type);
  const req = isProtected ? 1 : (required ? 1 : 0);
  updateFieldStmt.run(
    cleanLabel, type, req, isPrivate ? 1 : 0,
    normalizeOptions(type, options), normalizeMapping(osunyMapping), id
  );
  return { ok: true };
}

export function deleteField(id) {
  if (id === PROTECTED_ID) return { ok: false, reason: 'protected' };
  return deleteFieldStmt.run(id).changes > 0 ? { ok: true } : { ok: false, reason: 'not_found' };
}

const applyReorder = db.transaction((ids) => {
  ids.forEach((id, index) => updatePosition.run(index, id));
});

export function reorderFields(ids) {
  const known = new Set(selectIds.all().map((r) => r.id));
  const clean = ids.filter((id) => known.has(id));
  if (clean.length !== known.size) return { ok: false, reason: 'mismatch' };
  applyReorder(clean);
  return { ok: true };
}

export { FIELD_TYPES, FIELD_TYPE_LABELS, OSUNY_MAPPINGS };