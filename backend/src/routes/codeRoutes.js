import express from 'express';
import { runCode, getLanguages } from '../controllers/codeController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/execute', authenticate, runCode);
router.get('/languages', getLanguages);

export default router;
