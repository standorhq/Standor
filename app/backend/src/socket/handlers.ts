// FILE: apps/server/src/socket/handlers.ts

import type { Server as HttpServer } from 'node:http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';
import { env } from '../lib/env.js';

interface TokenPayload {
  userId: string;
}

// Track rooms: roomId → Set of socket IDs
const rooms = new Map<string, Set<string>>();

export function initSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
    transports: ['websocket', 'polling'],
    pingTimeout: 30_000,
    pingInterval: 10_000,
  });

  // Auth middleware
  io.use((socket, next) => {
    const token = (socket.handshake.auth as { token?: string }).token;
    if (!token) {
      next(new Error('No token'));
      return;
    }
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
      (socket as Socket & { userId: string }).userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as Socket & { userId: string }).userId;
    console.log(`[socket] connected: ${socket.id} (user: ${userId})`);

    // Join room
    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      if (!rooms.has(roomId)) rooms.set(roomId, new Set());
      rooms.get(roomId)!.add(socket.id);

      socket.to(roomId).emit('user-joined', { userId, socketId: socket.id });
      socket.emit('room-info', { participants: rooms.get(roomId)!.size });
    });

    // Code sync (with throttle guard — max 60 events/s)
    let codeEventCount = 0;
    const codeWindow = setInterval(() => { codeEventCount = 0; }, 1000);

    socket.on('code-change', (data: { roomId: string; code: string; language: string }) => {
      if (codeEventCount > 60) return; // rate guard
      codeEventCount++;
      socket.to(data.roomId).emit('code-update', { code: data.code, language: data.language });
    });

    // Chat message
    socket.on('chat-message', (data: { roomId: string; sender: string; text: string; ts: number }) => {
      // Sanitize text
      const sanitized = data.text.replace(/</g, '&lt;').replace(/>/g, '&gt;').slice(0, 500);
      io.to(data.roomId).emit('chat-message', { sender: data.sender, text: sanitized, ts: data.ts });
    });

    // WebRTC signaling
    socket.on('webrtc-offer', (data: { roomId: string; offer: RTCSessionDescriptionInit }) => {
      socket.to(data.roomId).emit('webrtc-offer', { offer: data.offer, from: socket.id });
    });

    socket.on('webrtc-answer', (data: { roomId: string; answer: RTCSessionDescriptionInit }) => {
      socket.to(data.roomId).emit('webrtc-answer', { answer: data.answer, from: socket.id });
    });

    socket.on('webrtc-ice', (data: { roomId: string; candidate: RTCIceCandidateInit }) => {
      socket.to(data.roomId).emit('webrtc-ice', { candidate: data.candidate, from: socket.id });
    });

    // Disconnect
    socket.on('disconnect', () => {
      clearInterval(codeWindow);
      rooms.forEach((members, roomId) => {
        if (members.delete(socket.id)) {
          socket.to(roomId).emit('user-left', { userId, socketId: socket.id });
          if (members.size === 0) rooms.delete(roomId);
        }
      });
      console.log(`[socket] disconnected: ${socket.id}`);
    });
  });

  // Yjs WebSocket handler path
  io.of('/yjs').on('connection', (socket) => {
    // y-websocket handles its own protocol; just log
    console.log(`[yjs] connection: ${socket.id}`);
  });

  return io;
}
