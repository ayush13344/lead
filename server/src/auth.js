import jwt from 'jsonwebtoken';
import { unauthorized } from './errors.js';

const secret = () => process.env.JWT_SECRET || 'dev-only-secret-change-me';

export const signToken = (user) =>
  jwt.sign({ sub: user.id }, secret(), { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(unauthorized());
  try {
    const payload = jwt.verify(token, secret());
    req.userId = payload.sub;
    next();
  } catch {
    next(unauthorized('Session expired, please log in again'));
  }
}
