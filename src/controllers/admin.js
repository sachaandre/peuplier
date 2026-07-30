// Logique de l'interface admin.
import bcrypt from 'bcryptjs';
import db from '../../db/db.js';

const selectUserByEmail = db.prepare(
  'SELECT id, name, email, password_hash, role FROM users WHERE email = ?'
);

// Vérifie un couple email / mot de passe.
// Renvoie l'utilisateur (sans son empreinte) en cas de succès, sinon null.
export async function verifyLogin(email, password) {
  const user = selectUserByEmail.get(String(email ?? '').trim().toLowerCase());
  if (!user) return null;
  const ok = await bcrypt.compare(String(password ?? ''), user.password_hash);
  if (!ok) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}