// Routes d'administration : connexion, déconnexion, tableau de bord, liste, modération.
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { verifyLogin } from '../controllers/admin.js';
import { getSettings } from '../controllers/settings.js';
import { getFields } from '../controllers/form.js';
import {
  getCounters,
  listTestimonies,
  getTestimony,
  getEvents,
  changeState,
  deleteTestimony,
  STATES,
  OPEN_STATES,
  STATE_LABELS
} from '../controllers/testimony.js';

export async function adminRoutes(app) {
  app.get('/admin/login', (request, reply) => {
    if (request.session.user) return reply.redirect('/admin');
    return reply.view('admin/login.eta', { title: 'Connexion', error: null });
  });

  app.post('/admin/login', async (request, reply) => {
    const { email, password } = request.body ?? {};
    const user = await verifyLogin(email, password);
    if (!user) {
      return reply.code(401).view('admin/login.eta', {
        title: 'Connexion',
        error: 'Identifiants incorrects.'
      });
    }
    request.session.user = user;
    return reply.redirect('/admin');
  });

  app.post('/admin/logout', (request, reply) => {
    request.session.destroy((err) => {
      if (err) {
        request.log.error(err);
        reply.code(500).send('Erreur lors de la déconnexion.');
        return;
      }
      reply.redirect('/admin/login');
    });
  });

  app.get('/admin', { preHandler: requireAuth }, (request, reply) => {
    return reply.view('admin/dashboard.eta', {
      title: 'Tableau de bord',
      user: request.session.user,
      settings: getSettings(),
      counters: getCounters(),
      labels: STATE_LABELS
    });
  });

  app.get('/admin/temoignages', { preHandler: requireAuth }, (request, reply) => {
    const rawState = request.query?.state;
    const state = STATES.includes(rawState) ? rawState : null;
    const page = Math.max(1, Number.parseInt(request.query?.page, 10) || 1);
    const result = listTestimonies({ page, state });
    return reply.view('admin/testimony-list.eta', {
      title: 'Témoignages',
      user: request.session.user,
      state,
      labels: STATE_LABELS,
      ...result
    });
  });

  app.get('/admin/temoignages/:id', { preHandler: requireAuth }, (request, reply) => {
    const testimony = getTestimony(request.params.id);
    if (!testimony) {
      return reply.code(404).view('admin/not-found.eta', { title: 'Introuvable' });
    }
    const fields = getFields()
      .filter((f) => testimony.data[f.id] !== undefined)
      .map((f) => ({
        label: f.label,
        private: f.private,
        value: Array.isArray(testimony.data[f.id])
          ? testimony.data[f.id].join(', ')
          : testimony.data[f.id]
      }));
    const transitions = OPEN_STATES
      .filter((s) => s !== testimony.state)
      .map((s) => ({ value: s, label: STATE_LABELS[s] }));
    return reply.view('admin/testimony-detail.eta', {
      title: 'Détail du témoignage',
      user: request.session.user,
      testimony,
      fields,
      geo: testimony.data.city_metadata ?? null,
      events: getEvents(request.params.id),
      transitions,
      canDelete: request.session.user.role === 'admin'
    });
  });

  app.post('/admin/temoignages/:id/etat', { preHandler: requireAuth }, (request, reply) => {
    const toState = request.body?.state;
    const note = request.body?.note;
    const result = changeState({
      id: request.params.id,
      toState,
      user: request.session.user,
      note
    });
    if (!result.ok) return reply.code(400).send("Changement d'état invalide.");
    return reply.redirect(`/admin/temoignages/${request.params.id}`);
  });

  app.post(
    '/admin/temoignages/:id/supprimer',
    { preHandler: [requireAuth, requireRole('admin')] },
    (request, reply) => {
      deleteTestimony(request.params.id);
      return reply.redirect('/admin/temoignages');
    }
  );
}