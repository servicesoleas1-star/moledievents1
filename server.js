import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import supabase from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Throttles brute-force credential guessing — 10 attempts per 15 minutes
// per IP, independent of whether each attempt succeeds or fails.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, errors: ['Trop de tentatives. Réessayez dans quelques minutes.'] },
});

/**
 * Sign-in — checks the `users` table (UML DC-02 `User`: email, password_hash,
 * status, role) directly, no third-party auth provider. Only email +
 * password are verified here; password reset and registration are separate
 * pages/flows and are intentionally not touched by this endpoint.
 */
app.post('/api/auth/login', loginLimiter, async (req, res) => {
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

    // Same generic message whether the account doesn't exist or the
    // password is wrong — distinguishing the two lets an attacker enumerate
    // registered emails.
    const invalidCredentials = () =>
      res.status(401).json({ ok: false, errors: ['Email ou mot de passe incorrect.'] });

    if (!user) {
      // Still run bcrypt against a dummy hash so the response time doesn't
      // leak whether the email exists.
      await bcrypt.compare(password, '$2a$10$CwTycUXWue0Thq9StjUM0uJ8lVQaGjkC3f6dGxjmqhF6xUwsr2gqK');
      return invalidCredentials();
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
      return invalidCredentials();
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

/**
 * Countries & payment methods for the Tarifs page — read straight from the
 * `country_config` / `payment_methods` tables (configured via the admin
 * panel / Aggregator module). If a table is empty or missing, we return an
 * empty array rather than inventing placeholder data client-side.
 */
app.get('/api/countries', async (req, res) => {
  try {
    const { data, error } = await supabase.from('country_config').select('*');
    if (error) throw error;
    return res.json({ ok: true, countries: data || [] });
  } catch (err) {
    console.error('Countries fetch error:', err.message);
    return res.json({ ok: true, countries: [] });
  }
});

app.get('/api/payment-methods', async (req, res) => {
  try {
    const { data, error } = await supabase.from('payment_methods').select('*');
    if (error) throw error;
    return res.json({ ok: true, methods: data || [] });
  } catch (err) {
    console.error('Payment methods fetch error:', err.message);
    return res.json({ ok: true, methods: [] });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
