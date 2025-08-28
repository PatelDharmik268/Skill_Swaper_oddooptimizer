// Migration script to add 'read' field to all existing messages
const mongoose = require('mongoose');
const Message = require('../models/Message');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skill_swaper';

async function migrate() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const result = await Message.updateMany(
    { read: { $exists: false } },
    { $set: { read: false } }
  );
  console.log('Migration complete:', result.modifiedCount, 'messages updated.');
  mongoose.disconnect();
}

migrate();
