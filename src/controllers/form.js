// Lecture des champs configurés et validation d'une soumission.
import db from '../../db/db.js';

const selectFields = db.prepare(
  `SELECT id, label, field_type, required, private, position, options
   FROM form_fields
   ORDER BY position ASC, created_at ASC`
);

// Renvoie les champs du formulaire, normalisés pour la vue.
export function getFields() {
  return selectFields.all().map((f) => ({
    id: f.id,
    label: f.label,
    fieldType: f.field_type,
    required: f.required === 1,
    private: f.private === 1,
    options: f.options ? JSON.parse(f.options) : []
  }));
}

// Valide la soumission contre les champs vivants.
// Renvoie les réponses nettoyées et la liste des erreurs.
export function validateSubmission(fields, body) {
  const data = {};
  const errors = [];

  for (const field of fields) {
    const raw = body[field.id];
    const value = Array.isArray(raw) ? raw : raw ?? '';
    const isEmpty = Array.isArray(value)
      ? value.length === 0
      : String(value).trim() === '';

    if (field.required && isEmpty) {
      errors.push({ id: field.id, label: field.label });
      continue;
    }
    if (!isEmpty) data[field.id] = value;
  }

  return { valid: errors.length === 0, errors, data };
}