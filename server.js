const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const messageRoutes = require('./routes/messages');
const chatContactsRoutes = require('./routes/chatContacts');
require('dotenv').config();
const feedbackRoutes = require('./routes/feedback');
const app = express();
const PORT = process.env.PORT || 5000;

// Multer setup for file uploads (memory storage)
const upload = multer({ storage: multer.memoryStorage() });
app.set('upload', upload); // Export for use in routes

// Connect to MongoDB
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
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Support form-data (text fields)

app.use('/api/feedback', feedbackRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chat-contacts', chatContactsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const swapOfferRoutes = require('./routes/swapOffers');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/swap-offers', swapOfferRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Server Error'
  });
});

// Export toBase64 function for use in routes
const toBase64 = (buffer, mimetype) => `data:${mimetype};base64,${buffer.toString('base64')}`;
app.set('toBase64', toBase64);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;