// Gardes pour les routes admin.

// Exige un utilisateur connecté ; redirige vers la page de login sinon.
export async function requireAuth(request, reply) {
  if (!request.session.user) {
    return reply.redirect('/admin/login');
  }
}

// Exige un rôle précis (ex : 'admin'). À placer après requireAuth.
export function requireRole(role) {
  return async function (request, reply) {
    const user = request.session.user;
    if (!user || user.role !== role) {
      return reply.code(403).view('admin/forbidden.eta', { title: 'Accès refusé' });
    }
  };
}