// Routes d'administration : connexion, déconnexion, tableau de bord, liste.
import { requireAuth } from '../middlewares/auth.js';
import { verifyLogin } from '../controllers/admin.js';
import { getSettings } from '../controllers/settings.js';
import { getCounters, listTestimonies, STATES } from '../controllers/testimony.js';

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
    const settings = getSettings();
    return reply.view('admin/dashboard.eta', {
      title: 'Tableau de bord',
      user: request.session.user,
      settings,
      counters: getCounters()
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
      ...result
    });
  });
}