// FILE: apps/server/src/routes/sessions.ts

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { analyzeCode } from '../lib/ai.js';
import { sendSessionReport } from '../lib/email.js';
import type { Difficulty } from '@prisma/client';

export const sessionRouter = Router();
sessionRouter.use(requireAuth);

// POST /api/sessions — create session
sessionRouter.post('/', async (req: AuthRequest, res) => {
  const schema = z.object({
    problem: z.string().min(2).max(200),
    difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const diffMap: Record<string, Difficulty> = { easy: 'EASY', medium: 'MEDIUM', hard: 'HARD' };

  try {
    const session = await prisma.session.create({
      data: {
        problem: parsed.data.problem,
        difficulty: diffMap[parsed.data.difficulty] ?? 'MEDIUM',
        hostId: req.userId!,
      },
    });
    res.status(201).json(session);
  } catch (e) {
    console.error('[sessions/create]', e);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// GET /api/sessions/my-sessions
sessionRouter.get('/my-sessions', async (req: AuthRequest, res) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { OR: [{ hostId: req.userId }, { participantId: req.userId }] },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
    res.json(sessions);
  } catch {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// GET /api/sessions/:roomId
sessionRouter.get('/:roomId', async (req: AuthRequest, res) => {
  try {
    const session = await prisma.session.findUnique({ where: { roomId: req.params['roomId'] } });
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    res.json(session);
  } catch {
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// POST /api/sessions/:roomId/join
sessionRouter.post('/:roomId/join', async (req: AuthRequest, res) => {
  try {
    const session = await prisma.session.findUnique({ where: { roomId: req.params['roomId'] } });
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    if (session.status !== 'ACTIVE') {
      res.status(400).json({ error: 'Session is not active' });
      return;
    }
    if (!session.participantId && session.hostId !== req.userId) {
      await prisma.session.update({
        where: { id: session.id },
        data: { participantId: req.userId },
      });
    }
    res.json({ joined: true });
  } catch {
    res.status(500).json({ error: 'Failed to join session' });
  }
});

// POST /api/sessions/:roomId/snapshot
sessionRouter.post('/:roomId/snapshot', async (req: AuthRequest, res) => {
  const schema = z.object({
    content: z.string().max(100_000),
    language: z.string().min(1).max(50),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid snapshot data' });
    return;
  }

  try {
    const session = await prisma.session.findUnique({ where: { roomId: req.params['roomId'] } });
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Keep max 20 snapshots
    const snapshots = [...session.codeSnapshots];
    snapshots.push({ content: parsed.data.content, language: parsed.data.language, timestamp: new Date() });
    if (snapshots.length > 20) snapshots.splice(0, snapshots.length - 20);

    await prisma.session.update({
      where: { id: session.id },
      data: { codeSnapshots: snapshots },
    });

    res.json({ saved: true });
  } catch {
    res.status(500).json({ error: 'Failed to save snapshot' });
  }
});

// POST /api/sessions/:roomId/analyze
sessionRouter.post('/:roomId/analyze', async (req: AuthRequest, res) => {
  const schema = z.object({
    code: z.string().min(1).max(50_000),
    language: z.string().min(1).max(50),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  try {
    const session = await prisma.session.findUnique({ where: { roomId: req.params['roomId'] } });
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const result = await analyzeCode(parsed.data.code, parsed.data.language);

    const aiAnalysis = {
      timeComplexity: result.complexity.time,
      spaceComplexity: result.complexity.space,
      correctness: result.overallScore,
      bugs: result.bugs,
      suggestions: result.suggestions,
      codeStyle: result.style,
      overallScore: result.overallScore,
      summary: result.summary,
      tests: result.tests,
      analyzedAt: new Date(),
    };

    await prisma.session.update({ where: { id: session.id }, data: { aiAnalysis } });

    res.json({ aiAnalysis });
  } catch (e) {
    console.error('[sessions/analyze]', e);
    res.status(500).json({ error: 'AI analysis failed' });
  }
});

// POST /api/sessions/:roomId/end
sessionRouter.post('/:roomId/end', async (req: AuthRequest, res) => {
  try {
    const session = await prisma.session.findUnique({
      where: { roomId: req.params['roomId'] },
      include: { host: true, participant: true },
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    if (session.hostId !== req.userId) {
      res.status(403).json({ error: 'Only the host can end the session' });
      return;
    }

    const updated = await prisma.session.update({
      where: { id: session.id },
      data: { status: 'COMPLETED', endedAt: new Date() },
    });

    // Send email reports asynchronously (don't block response)
    void sendSessionReport(session).catch((e) => console.error('[email]', e));

    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to end session' });
  }
});
