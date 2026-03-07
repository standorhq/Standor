// FILE: apps/server/src/server.ts

import 'dotenv/config';
import express from 'express';
import { createServer } from 'node:http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import cron from 'node-cron';

import { initSocket } from './socket/handlers.js';
import { authRouter } from './routes/auth.js';
import { sessionRouter } from './routes/sessions.js';
import { codeRouter } from './routes/code.js';
import { prisma } from './lib/prisma.js';
import { env } from './lib/env.js';

const app = express();
const httpServer = createServer(app);

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '64kb' }));

// Global rate limiter: 100 req / 15 min per IP
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));
app.use('/api/auth', authRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/code', codeRouter);

// ── Socket.IO ─────────────────────────────────────────────────────────────────
initSocket(httpServer);

// ── Cron: snapshot active sessions every 30s ──────────────────────────────────
cron.schedule('*/30 * * * * *', async () => {
  // Snapshot is handled client-side; cron here cleans up stale active sessions
  try {
    const cutoff = new Date(Date.now() - 4 * 60 * 60 * 1000); // 4h
    await prisma.session.updateMany({
      where: { status: 'ACTIVE', startedAt: { lt: cutoff } },
      data: { status: 'COMPLETED', endedAt: new Date() },
    });
  } catch (e) {
    console.error('[cron] snapshot cleanup error:', e);
  }
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
async function shutdown() {
  await prisma.$disconnect();
  httpServer.close();
  process.exit(0);
}
process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());

// ── Start ─────────────────────────────────────────────────────────────────────
httpServer.listen(env.PORT, () => {
  console.log(`[server] running on http://localhost:${env.PORT}`);
});

export { app };
