import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import supabase from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

/**
 * Sign-in — checks the `users` table (UML DC-02 `User`: email, password_hash,
 * status, role) directly, no third-party auth provider. Only email +
 * password are verified here; password reset and registration are separate
 * pages/flows and are intentionally not touched by this endpoint.
 */
app.post('/api/auth/login', async (req, res) => {
  const { email, password, visitorId } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ ok: false, errors: ['Email et mot de passe requis.'] });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('user_id, role, full_name, email, password_hash, status')
      .eq('email', String(email).trim().toLowerCase())
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      return res.status(401).json({ ok: false, errors: ['Aucun compte trouvé avec cette adresse email.'] });
    }
    if (user.status === 'SUSPENDED' || user.status === 'DELETED') {
      return res.status(403).json({ ok: false, errors: ['Ce compte a été suspendu. Contactez le support.'] });
    }

    const valid = await bcrypt.compare(password, user.password_hash || '');

    await supabase.from('login_logs').insert({
      user_id: user.user_id,
      success: valid,
      ip: req.ip,
      browser: req.headers['user-agent'] || '',
    }).then(null, () => {}); // best-effort audit trail, never blocks the response

    if (!valid) {
      return res.status(401).json({ ok: false, errors: ['Mot de passe incorrect.'] });
    }

    // The visitor_id cookie (if any) is owned by another workstream; we only
    // forward it here so the account can eventually be linked to it.
    if (visitorId) {
      await supabase
        .from('visitors')
        .update({ account_id: user.user_id })
        .eq('visitor_id', visitorId)
        .then(null, () => {});
    }

    const redirect = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? '/admin' : '/compte';
    return res.json({ ok: true, role: user.role, redirect });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ ok: false, errors: ["Une erreur est survenue, réessayez."] });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
