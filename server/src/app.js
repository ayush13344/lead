import express from 'express';
import cors from 'cors';
import { errorHandler } from './errors.js';
import { authRouter } from './routes/auth.js';
import { leadsRouter } from './routes/leads.js';

export function createApp(db) {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || true }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api/auth', authRouter(db));
  app.use('/api/leads', leadsRouter(db));

  app.use('/api', (req, res) => res.status(404).json({ error: 'Route not found' }));
  app.use(errorHandler);
  return app;
}
