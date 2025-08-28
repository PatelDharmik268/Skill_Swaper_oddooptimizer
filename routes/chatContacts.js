const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');

// New route to get chat contacts
router.get('/contacts/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const messages = await Message.find({
      $or: [ { from: userObjectId }, { to: userObjectId } ]
    });
    // Collect all unique contact ObjectIds (other than self)
    const contactIds = Array.from(new Set(
      messages.map(m => {
        if (m.from.equals(userObjectId)) return m.to.toString();
        if (m.to.equals(userObjectId)) return m.from.toString();
        return null;
      }).filter(Boolean)
    ));
    if (!contactIds.length) {
      return res.json({ success: true, users: [] });
    }
    const users = await User.find({ _id: { $in: contactIds }, isActive: true });
    const publicProfiles = users.map(user => user.getPublicProfile());
    res.json({ success: true, users: publicProfiles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching chat contacts' });
  }
});

module.exports = router;
