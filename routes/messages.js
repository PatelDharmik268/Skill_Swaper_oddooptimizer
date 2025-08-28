const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const mongoose = require('mongoose');


// Send a new message
router.post('/', async (req, res) => {
  let { from, to, content } = req.body;
  if (!from || !to || !content) {
    console.error('Missing fields in message POST:', { from, to, content });
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }
  // Convert to ObjectId if possible
  if (mongoose.Types.ObjectId.isValid(from)) from = new mongoose.Types.ObjectId(from);
  if (mongoose.Types.ObjectId.isValid(to)) to = new mongoose.Types.ObjectId(to);
  try {
    const message = new Message({ from, to, content });
    await message.save();
    res.json({ success: true, message });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ success: false, message: 'Error sending message', error: err.message });
  }
});

// Get unread message counts for each user (for sidebar and navbar badges)
router.get('/unread-counts/:userId', async (req, res) => {
  const { userId } = req.params;
  // Debug log
  console.log('Unread counts request for userId:', userId);
  // Accept only valid ObjectId, but for dev, allow 24-char non-hex and warn
  let objectId;
  if (mongoose.Types.ObjectId.isValid(userId)) {
    objectId = new mongoose.Types.ObjectId(userId);
  } else if (typeof userId === 'string' && userId.length === 24) {
    // Try to use as ObjectId anyway, but warn
    console.warn('userId is 24 chars but not valid hex. Forcing as ObjectId for dev:', userId);
    try {
      objectId = new mongoose.Types.ObjectId(userId);
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Invalid userId (not ObjectId)' });
    }
  } else {
    return res.status(400).json({ success: false, message: 'Invalid userId' });
  }
  try {
    // Group by sender, count unread messages for this user
    const counts = await Message.aggregate([
      { $match: { to: objectId, read: false } },
      { $group: { _id: '$from', count: { $sum: 1 } } }
    ]);
    // Convert to { userId: count }
    const result = {};
    counts.forEach(c => { result[c._id.toString()] = c.count; });
    res.json({ success: true, counts: result });
  } catch (err) {
    console.error('Error in unread-counts:', err);
    res.status(500).json({ success: false, message: 'Error fetching unread counts' });
  }
});

// Mark messages as read from a specific user
router.post('/mark-read', async (req, res) => {
  const { userId, fromUserId } = req.body;
  if (!userId || !fromUserId) return res.status(400).json({ success: false, message: 'Missing fields' });
  try {
    await Message.updateMany(
      { from: fromUserId, to: userId, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error marking messages as read' });
  }
});

// Get all messages between two users (keep this last)
router.get('/:userId1/:userId2', async (req, res) => {
  const { userId1, userId2 } = req.params;
  console.log('Fetching messages between:', userId1, userId2);
  try {
    // Support both ObjectId and string for backward compatibility
    let id1 = userId1, id2 = userId2;
    let oid1 = mongoose.Types.ObjectId.isValid(userId1) ? new mongoose.Types.ObjectId(userId1) : null;
    let oid2 = mongoose.Types.ObjectId.isValid(userId2) ? new mongoose.Types.ObjectId(userId2) : null;
    const query = {
      $or: [
        { from: id1, to: id2 },
        { from: id2, to: id1 },
        ...(oid1 && oid2 ? [
          { from: oid1, to: oid2 },
          { from: oid2, to: oid1 }
        ] : [])
      ]
    };
    console.log('Message find query:', query);
    const messages = await Message.find(query).sort('timestamp');
    res.json({ success: true, messages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ success: false, message: 'Error fetching messages' });
  }
});

module.exports = router;