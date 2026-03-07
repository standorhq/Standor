import Session from '../models/Session.js';
import User from '../models/User.js';
import { analyzeCode, basicCodeAnalysis } from '../lib/ai.js';
import { sendSessionFeedback } from '../lib/email.js';
import { nanoid } from 'nanoid';

export const createSession = async (req, res) => {
  try {
    const { problem, difficulty } = req.body;
    const hostId = req.userId;

    if (!problem) {
      return res.status(400).json({ error: 'Problem is required' });
    }

    const roomId = nanoid(10);

    const session = await Session.create({
      problem,
      difficulty: difficulty || 'medium',
      host: hostId,
      roomId,
      status: 'active'
    });

    await session.populate('host', 'name email avatar');

    res.status(201).json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
};

export const getSession = async (req, res) => {
  try {
    const { roomId } = req.params;

    const session = await Session.findOne({ roomId })
      .populate('host', 'name email avatar')
      .populate('participant', 'name email avatar');

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
};

export const joinSession = async (req, res) => {
  try {
    const { roomId } = req.params;
    const participantId = req.userId;

    const session = await Session.findOne({ roomId });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.status !== 'active') {
      return res.status(400).json({ error: 'Session is not active' });
    }

    if (session.participant && session.participant.toString() !== participantId) {
      return res.status(400).json({ error: 'Session already has a participant' });
    }

    session.participant = participantId;
    await session.save();
    await session.populate(['host', 'participant'], 'name email avatar');

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({ error: 'Failed to join session' });
  }
};

export const saveSnapshot = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content, language } = req.body;

    const session = await Session.findOne({ roomId });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.codeSnapshots.push({
      content,
      language,
      timestamp: new Date()
    });

    // Keep only last 20 snapshots
    if (session.codeSnapshots.length > 20) {
      session.codeSnapshots = session.codeSnapshots.slice(-20);
    }

    await session.save();

    res.json({
      success: true,
      snapshot: session.codeSnapshots[session.codeSnapshots.length - 1]
    });
  } catch (error) {
    console.error('Save snapshot error:', error);
    res.status(500).json({ error: 'Failed to save snapshot' });
  }
};

export const analyzeSession = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { code, language } = req.body;

    const session = await Session.findOne({ roomId });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    let analysis;
    const aiResult = await analyzeCode(code, language, session.problem);
    
    if (aiResult.success) {
      analysis = aiResult.analysis;
    } else {
      analysis = basicCodeAnalysis(code, language);
    }

    session.aiAnalysis = analysis;
    await session.save();

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Analyze session error:', error);
    res.status(500).json({ error: 'Failed to analyze code' });
  }
};

export const endSession = async (req, res) => {
  try {
    const { roomId } = req.params;

    const session = await Session.findOne({ roomId })
      .populate('host', 'name email')
      .populate('participant', 'name email');

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.status = 'completed';
    session.endedAt = new Date();
    await session.save();

    // Send feedback emails
    if (session.aiAnalysis) {
      const duration = Math.round((session.endedAt - session.startedAt) / 1000 / 60);
      const sessionData = {
        problem: session.problem,
        difficulty: session.difficulty,
        duration: `${duration} minutes`
      };

      if (session.host?.email) {
        await sendSessionFeedback(session.host.email, session.aiAnalysis, sessionData);
      }

      if (session.participant?.email) {
        await sendSessionFeedback(session.participant.email, session.aiAnalysis, sessionData);
      }
    }

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
};

export const getUserSessions = async (req, res) => {
  try {
    const userId = req.userId;

    const sessions = await Session.find({
      $or: [{ host: userId }, { participant: userId }]
    })
      .populate('host', 'name email avatar')
      .populate('participant', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Get user sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};
