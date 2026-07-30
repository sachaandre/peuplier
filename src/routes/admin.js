// Routes d'administration : connexion, déconnexion, tableau de bord.
import { requireAuth } from '../middlewares/auth.js';
import { verifyLogin } from '../controllers/admin.js';

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

  app.get('/admin', { preHandler: requireAuth }, (request, reply) =>
    reply.view('admin/dashboard.eta', {
      title: 'Tableau de bord',
      user: request.session.user
    })
  );
}