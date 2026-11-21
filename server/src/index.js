import 'dotenv/config';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createApp } from './app.js';
import { openDb } from './db.js';

const app = createApp(openDb());

// In production, serve the built React app from the same server (one deployable unit).
const clientDist = join(dirname(fileURLToPath(import.meta.url)), '../../client/dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(join(clientDist, 'index.html')));
}

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Lead Manager API listening on http://localhost:${port}`));
