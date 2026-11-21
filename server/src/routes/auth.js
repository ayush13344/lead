import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { requireAuth, signToken } from '../auth.js';
import { badRequest, conflict, unauthorized, wrap } from '../errors.js';
import { validateLogin, validateSignup } from '../validate.js';

const publicUser = ({ id, name, email }) => ({ id, name, email });

export function authRouter(db) {
  const router = Router();

  router.post(
    '/signup',
    wrap(async (req, res) => {
      const { errors, value } = validateSignup(req.body);
      if (Object.keys(errors).length) throw badRequest(errors);

      const exists = db.prepare('SELECT 1 FROM users WHERE email = ?').get(value.email);
      if (exists) throw conflict('Email already registered', { email: 'This email is already in use' });

      const hash = await bcrypt.hash(value.password, 10);
      const { lastInsertRowid } = db
        .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
        .run(value.name, value.email, hash);

      const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(lastInsertRowid);
      res.status(201).json({ token: signToken(user), user: publicUser(user) });
    }),
  );

  router.post(
    '/login',
    wrap(async (req, res) => {
      const { errors, value } = validateLogin(req.body);
      if (Object.keys(errors).length) throw badRequest(errors);

      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(value.email);
      // Same message for unknown email and wrong password so accounts can't be enumerated.
      const ok = user && (await bcrypt.compare(value.password, user.password_hash));
      if (!ok) throw unauthorized('Incorrect email or password');

      res.json({ token: signToken(user), user: publicUser(user) });
    }),
  );

  router.get('/me', requireAuth, (req, res) => {
    const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.userId);
    if (!user) throw unauthorized('Account no longer exists');
    res.json({ user });
  });

  return router;
}
