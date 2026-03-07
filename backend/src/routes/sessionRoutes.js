import express from 'express';
import {
  createSession,
  getSession,
  joinSession,
  saveSnapshot,
  analyzeSession,
  endSession,
  getUserSessions
} from '../controllers/sessionController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createSession);
router.get('/my-sessions', authenticate, getUserSessions);
router.get('/:roomId', authenticate, getSession);
router.post('/:roomId/join', authenticate, joinSession);
router.post('/:roomId/snapshot', authenticate, saveSnapshot);
router.post('/:roomId/analyze', authenticate, analyzeSession);
router.post('/:roomId/end', authenticate, endSession);

export default router;
