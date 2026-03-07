// FILE: apps/server/src/routes/problems.ts
// Returns the curated demo problem list for room creation UI.

import { Router } from 'express';
import { DEMO_PROBLEMS } from '../data/problems.js';
import { requireAuth } from '../middleware/auth.js';

export const problemsRouter = Router();
problemsRouter.use(requireAuth);

// GET /api/problems
problemsRouter.get('/', (_req, res) => {
  res.json(DEMO_PROBLEMS);
});
