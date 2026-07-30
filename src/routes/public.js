// Routes publiques : dépôt d'un témoignage.
import { getFields, validateSubmission } from '../controllers/form.js';
import { createTestimony } from '../controllers/testimony.js';

export async function publicRoutes(app) {
  app.get('/temoigner', (request, reply) =>
    reply.view('public/form.eta', {
      title: 'Déposer un témoignage',
      fields: getFields(),
      errors: [],
      values: {}
    })
  );

  app.post('/temoigner', { config: { rateLimit: { max: 5, timeWindow: '1 hour'} }}, (request, reply) => {
    const fields = getFields();
    const body = request.body ?? {};
    const { valid, errors, data } = validateSubmission(fields, body);

    if (!valid) {
      return reply.code(400).view('public/form.eta', {
        title: 'Déposer un témoignage',
        fields,
        errors,
        values: body
      });
    }

    createTestimony(data);
    return reply.redirect('/merci');
  });

  app.get('/merci', (request, reply) =>
    reply.view('public/thanks.eta', { title: 'Merci' })
  );
}