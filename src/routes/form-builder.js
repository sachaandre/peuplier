// Routes du constructeur de formulaire (réservées au rôle admin).
import { requireAuth, requireRole } from '../middlewares/auth.js';
import {
  listFields, getField, createField, updateField, deleteField, reorderFields,
  FIELD_TYPES, FIELD_TYPE_LABELS, OSUNY_MAPPINGS
} from '../controllers/form.js';

const adminOnly = { preHandler: [requireAuth, requireRole('admin')] };
const typeChoices = () => FIELD_TYPES.map((t) => ({ value: t, label: FIELD_TYPE_LABELS[t] }));

export async function formBuilderRoutes(app) {
  app.get('/admin/formulaire', adminOnly, (request, reply) =>
    reply.view('admin/form-builder.eta', {
      title: 'Constructeur de formulaire',
      user: request.session.user,
      fields: listFields(),
      types: typeChoices(),
      mappings: OSUNY_MAPPINGS
    })
  );

  app.post('/admin/formulaire', adminOnly, (request, reply) => {
    const b = request.body ?? {};
    createField({
      label: b.label, fieldType: b.field_type,
      required: b.required === 'on', isPrivate: b.private === 'on',
      options: b.options, osunyMapping: b.osuny_block_mapping
    });
    return reply.redirect('/admin/formulaire');
  });

  app.get('/admin/formulaire/:id/editer', adminOnly, (request, reply) => {
    const field = getField(request.params.id);
    if (!field) return reply.code(404).view('admin/not-found.eta', { title: 'Introuvable' });
    return reply.view('admin/form-field-edit.eta', {
      title: 'Modifier un champ',
      user: request.session.user,
      field, types: typeChoices(), mappings: OSUNY_MAPPINGS
    });
  });

  app.post('/admin/formulaire/:id/editer', adminOnly, (request, reply) => {
    const b = request.body ?? {};
    const result = updateField(request.params.id, {
      label: b.label, fieldType: b.field_type,
      required: b.required === 'on', isPrivate: b.private === 'on',
      options: b.options, osunyMapping: b.osuny_block_mapping
    });
    if (!result.ok) return reply.code(400).send('Modification impossible.');
    return reply.redirect('/admin/formulaire');
  });

  app.post('/admin/formulaire/:id/supprimer', adminOnly, (request, reply) => {
    deleteField(request.params.id);
    return reply.redirect('/admin/formulaire');
  });

  app.post('/admin/formulaire/ordre', adminOnly, (request, reply) => {
    const ids = Array.isArray(request.body?.ids) ? request.body.ids : null;
    if (!ids) return reply.code(400).send({ ok: false });
    return reply.send(reorderFields(ids));
  });
}