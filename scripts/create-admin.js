// CLI : création d'un utilisateur. Usage : npm run create-admin
import { randomUUID } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import bcrypt from 'bcryptjs';
import db from '../db/db.js';

// Flux de sortie que l'on peut "couper" pour masquer la saisie du mot de passe.
let muted = false;
const output = new Writable({
  write(chunk, encoding, callback) {
    if (!muted) process.stdout.write(chunk, encoding);
    callback();
  }
});

const rl = createInterface({ input: process.stdin, output, terminal: true });

// Pose une question dont la réponse n'est pas affichée à l'écran.
async function questionHidden(query) {
  process.stdout.write(query); // le prompt est écrit directement, jamais masqué
  muted = true;                // coupe l'écho pendant la frappe
  try {
    return await rl.question('');
  } finally {
    muted = false;
    process.stdout.write('\n');
  }
}

const insertUser = db.prepare(
  'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
);

try {
  const name = (await rl.question('Nom : ')).trim();
  const email = (await rl.question('Email : ')).trim().toLowerCase();
  const password = (await questionHidden('Mot de passe (min. 8 caractères) : ')).trim();
  const confirm = (await questionHidden('Confirmer le mot de passe : ')).trim();
  const roleInput = (await rl.question('Rôle [admin/moderator] (admin par défaut) : ')).trim().toLowerCase();

  if (!name || !email) throw new Error('Nom et email sont obligatoires.');
  if (password.length < 8) throw new Error('Mot de passe trop court (min. 8 caractères).');
  if (password !== confirm) throw new Error('Les mots de passe ne correspondent pas.');
  const role = roleInput === 'moderator' ? 'moderator' : 'admin';

  const hash = await bcrypt.hash(password, 10);
  insertUser.run(randomUUID(), name, email, hash, role);
  process.stdout.write(`Utilisateur "${email}" créé avec le rôle ${role}.\n`);
} catch (err) {
  const msg = /UNIQUE/.test(err.message) ? 'Cet email existe déjà.' : err.message;
  process.stderr.write(`Échec : ${msg}\n`);
  process.exitCode = 1;
} finally {
  rl.close();
}