import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cron from 'node-cron';

import { initializeSocket } from './lib/socket.js';
import { verifyEmailConfig } from './lib/email.js';

import authRoutes from './routes/authRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import codeRoutes from './routes/codeRoutes.js';

import Session from './models/Session.js';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/code', codeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Standor API is running',
    timestamp: new Date().toISOString()
  });
});

// Initialize Socket.IO
const io = initializeSocket(server);

// Snapshot cron job (every 30 seconds for active sessions)
cron.schedule('*/30 * * * * *', async () => {
  try {
    const activeSessions = await Session.find({ status: 'active' });
    console.log(`Cron: Checking ${activeSessions.length} active sessions`);
  } catch (error) {
    console.error('Cron error:', error);
  }
});

// MongoDB connection
mongoose.connect(process.env.DB_URL)
  .then(async () => {
    console.log('✅ MongoDB connected');
    
    // Verify email configuration
    await verifyEmailConfig();
    
    // Start server
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Socket.IO initialized`);
      console.log(`✅ Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

export { io };
