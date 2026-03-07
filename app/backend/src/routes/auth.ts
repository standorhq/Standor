// FILE: apps/server/src/routes/auth.ts

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { env } from '../lib/env.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

export const authRouter = Router();

const googleClient = env.GOOGLE_CLIENT_ID ? new OAuth2Client(env.GOOGLE_CLIENT_ID) : null;

function signToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

function safeUser(user: { id: string; email: string; name: string; avatar: string | null; role: string }) {
  return { _id: user.id, email: user.email, name: user.name, avatar: user.avatar, role: user.role };
}

// POST /api/auth/register
authRouter.post('/register', async (req, res) => {
  const schema = z.object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    password: z.string().min(8).max(128),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { name, email, password } = parsed.data;

  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { name, email, password: hashed } });
    const token = signToken(user.id);

    res.status(201).json({ token, user: safeUser(user) });
  } catch (e) {
    console.error('[auth/register]', e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.password) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
    const token = signToken(user.id);
    res.json({ token, user: safeUser(user) });
  } catch (e) {
    console.error('[auth/login]', e);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/google
authRouter.post('/google', async (req, res) => {
  if (!googleClient) {
    res.status(503).json({ error: 'Google OAuth not configured' });
    return;
  }

  const { credential } = z.object({ credential: z.string().min(1) }).parse(req.body);

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      res.status(400).json({ error: 'Invalid Google token' });
      return;
    }

    const { sub: googleId, email, name = 'User', picture: avatar } = payload;

    let user = await prisma.user.findFirst({ where: { OR: [{ googleId }, { email }] } });
    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, avatar, lastLogin: new Date() },
      });
    } else {
      user = await prisma.user.create({ data: { googleId, email, name, avatar } });
    }

    const token = signToken(user.id);
    res.json({ token, user: safeUser(user) });
  } catch (e) {
    console.error('[auth/google]', e);
    res.status(500).json({ error: 'Google auth failed' });
  }
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(safeUser(user));
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});
