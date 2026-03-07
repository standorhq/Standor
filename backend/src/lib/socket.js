import { Server } from 'socket.io';

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Store active rooms and users
  const rooms = new Map();

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join interview room
    socket.on('join-room', async ({ roomId, userId, userName, role }) => {
      socket.join(roomId);
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map());
      }
      
      rooms.get(roomId).set(socket.id, { userId, userName, role });
      
      // Notify others in the room
      socket.to(roomId).emit('user-joined', {
        socketId: socket.id,
        userId,
        userName,
        role
      });

      // Send current room participants to the new user
      const participants = Array.from(rooms.get(roomId).values());
      socket.emit('room-users', participants);
      
      console.log(`${userName} joined room ${roomId} as ${role}`);
    });

    // Handle code changes
    socket.on('code-change', ({ roomId, code, language }) => {
      socket.to(roomId).emit('code-update', { code, language });
    });

    // Handle cursor position
    socket.on('cursor-change', ({ roomId, position }) => {
      socket.to(roomId).emit('cursor-update', {
        socketId: socket.id,
        position
      });
    });

    // Handle chat messages
    socket.on('chat-message', ({ roomId, message, userName }) => {
      io.to(roomId).emit('chat-message', {
        message,
        userName,
        timestamp: new Date().toISOString()
      });
    });

    // Handle WebRTC signaling for video/audio
    socket.on('webrtc-offer', ({ roomId, offer }) => {
      socket.to(roomId).emit('webrtc-offer', {
        offer,
        socketId: socket.id
      });
    });

    socket.on('webrtc-answer', ({ roomId, answer, targetSocketId }) => {
      io.to(targetSocketId).emit('webrtc-answer', {
        answer,
        socketId: socket.id
      });
    });

    socket.on('webrtc-ice-candidate', ({ roomId, candidate, targetSocketId }) => {
      if (targetSocketId) {
        io.to(targetSocketId).emit('webrtc-ice-candidate', {
          candidate,
          socketId: socket.id
        });
      } else {
        socket.to(roomId).emit('webrtc-ice-candidate', {
          candidate,
          socketId: socket.id
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      
      // Remove user from all rooms
      rooms.forEach((roomUsers, roomId) => {
        if (roomUsers.has(socket.id)) {
          const user = roomUsers.get(socket.id);
          roomUsers.delete(socket.id);
          
          // Notify others
          socket.to(roomId).emit('user-left', {
            socketId: socket.id,
            userName: user.userName
          });
          
          // Clean up empty rooms
          if (roomUsers.size === 0) {
            rooms.delete(roomId);
          }
        }
      });
    });
  });

  return io;
};
