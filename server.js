const express = require('express');
const http = require('http');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

app.prepare().then(() => {
  const expressApp = express();
  const server = http.createServer(expressApp);
  
  // Attach Socket.IO
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Track online users: Map<userId, socketId>
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // User register online
    socket.on('register-user', (userId) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;
        console.log(`👤 User ${userId} is online.`);
        io.emit('user-status-change', { userId, status: 'online' });
      }
    });

    // Join chat room
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`🏠 Socket ${socket.id} joined room: ${roomId}`);
    });

    // Send chat message in room
    socket.on('send-message', (data) => {
      const { roomId, message } = data;
      // Broadcast to other users in the room
      socket.to(roomId).emit('receive-message', message);
      console.log(`✉️ Message in ${roomId} from ${message.senderId}`);
    });

    // Typing indicators
    socket.on('typing', ({ roomId, userId, username }) => {
      socket.to(roomId).emit('typing', { roomId, userId, username });
    });

    socket.on('stop-typing', ({ roomId, userId }) => {
      socket.to(roomId).emit('stop-typing', { roomId, userId });
    });

    // WebRTC Calling signaling
    socket.on('call-user', ({ userToCall, signalData, from, callerName, callerAvatar }) => {
      const recipientSocketId = onlineUsers.get(userToCall);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('incoming-call', {
          signal: signalData,
          from,
          name: callerName,
          avatar: callerAvatar
        });
        console.log(`📞 Calling user ${userToCall} from ${from}`);
      }
    });

    socket.on('answer-call', ({ to, signal }) => {
      const callerSocketId = onlineUsers.get(to);
      if (callerSocketId) {
        io.to(callerSocketId).emit('call-accepted', signal);
        console.log(`👍 Call accepted by ${socket.userId || 'unknown'} for ${to}`);
      }
    });

    socket.on('ice-candidate', ({ to, candidate }) => {
      const recipientSocketId = onlineUsers.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('ice-candidate', candidate);
      }
    });

    socket.on('end-call', ({ to }) => {
      const recipientSocketId = onlineUsers.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('call-ended');
      }
      console.log(`🛑 Call ended between ${socket.userId} and ${to}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('user-status-change', { userId: socket.userId, status: 'offline' });
        console.log(`👤 User ${socket.userId} is offline.`);
      }
    });
  });

  // Default Next.js request handler
  expressApp.all('*all', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`🚀 Ready on http://localhost:${port}`);
  });
});
