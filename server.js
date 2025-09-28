const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

const PORT = process.env.PORT || 5000;

// Multer setup
const upload = multer({ storage: multer.memoryStorage() });
app.set('upload', upload);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skill_swaper';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('📦 MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import Routes
const authRoutes = require('./routes/auth');
const swapOfferRoutes = require('./routes/swapOffers');
const messageRoutes = require('./routes/messages');
const chatContactsRoutes = require('./routes/chatContacts');
const feedbackRoutes = require('./routes/feedback');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/swap-offers', swapOfferRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chat-contacts', chatContactsRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Store connected users (Map is efficient for this)
const connectedUsers = new Map();

// Socket.IO Logic
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Event to join a user-specific room
  socket.on('join', (userId) => {
    if (!userId) return;
    socket.join(userId);
    socket.userId = userId; // Associate userId with the socket connection
    connectedUsers.set(userId, socket.id);
    console.log(`✅ User ${userId} joined room '${userId}'`);
    console.log(`📊 Total connected users: ${connectedUsers.size}`);
  });

  // Event for handling new messages
  socket.on('sendMessage', async (data) => {
    console.log('📨 Received message:', data);
    const { from, to, content, timestamp, _id: tempId } = data;

    if (!from || !to || !content) {
      console.error('❌ Invalid message data:', data);
      socket.emit('messageError', { error: 'Invalid message data', tempId });
      return;
    }

    // This is the message object that will be broadcast instantly
    const messageForBroadcast = {
      _id: tempId || new mongoose.Types.ObjectId().toString(),
      from,
      to,
      content,
      timestamp: timestamp || new Date().toISOString(),
      read: false,
    };

    // 1. Broadcast message to both sender and receiver immediately
    io.to(to).emit('newMessage', messageForBroadcast);
    io.to(from).emit('newMessage', messageForBroadcast); // Also sends to sender for multi-device sync
    console.log(`🚀 Broadcasted message from ${from} to ${to}`);

    // 2. Save the message to the database in the background
    try {
      const Message = require('./models/Message');
      const newMessage = new Message({
        from,
        to,
        content,
        timestamp: messageForBroadcast.timestamp,
      });
      const savedMessage = await newMessage.save();
      console.log('💾 Message saved to DB with ID:', savedMessage._id);

      // 3. Emit a confirmation event with the permanent DB data
      const confirmedMessage = {
        _id: savedMessage._id.toString(),
        from: savedMessage.from.toString(),
        to: savedMessage.to.toString(),
        content: savedMessage.content,
        timestamp: savedMessage.timestamp,
        read: savedMessage.read
      };

      // Send confirmation to both users to update the temporary message
      io.to(from).emit('messageConfirmed', { tempId, confirmedMessage });
      io.to(to).emit('messageConfirmed', { tempId, confirmedMessage });
      console.log(`✅ Sent confirmation for tempId ${tempId}`);

    } catch (dbError) {
      console.error('💥 Database save error:', dbError);
      // Notify the sender that the message failed to save
      io.to(from).emit('messageError', {
        error: 'Failed to save message to database',
        tempId,
      });
    }
  });

  // Handle typing indicators
  socket.on('typing', ({ from, to }) => {
    socket.to(to).emit('userTyping', { from });
  });

  socket.on('stopTyping', ({ from, to }) => {
    socket.to(to).emit('userStoppedTyping', { from });
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      console.log(`🔌 User ${socket.userId} disconnected`);
      console.log(`📊 Total connected users: ${connectedUsers.size}`);
      // Optionally, broadcast that the user went offline
      socket.broadcast.emit('userStatusChanged', { userId: socket.userId, status: 'offline' });
    } else {
      console.log(`🔌 A user disconnected: ${socket.id}`);
    }
  });
});


// 404 and Error Handlers
app.use('*', (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});


server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = { app, io };