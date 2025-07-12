const mongoose = require('mongoose');

const swapOfferSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requester ID is required']
  },
  requestedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requested user ID is required']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  offeredSkills: {
    type: String,
    required: [true, 'Offered skills are required'],
    trim: true,
    maxlength: [500, 'Offered skills cannot exceed 500 characters']
  },
  wantedSkills: {
    type: String,
    required: [true, 'Wanted skills are required'],
    trim: true,
    maxlength: [500, 'Wanted skills cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
swapOfferSchema.index({ requesterId: 1, requestedUserId: 1 });
swapOfferSchema.index({ status: 1 });
swapOfferSchema.index({ createdAt: -1 });

// Virtual for checking if offer is still pending
swapOfferSchema.virtual('isPending').get(function() {
  return this.status === 'pending' && this.isActive;
});

// Method to get offer details with populated user data
swapOfferSchema.methods.getOfferWithUsers = async function() {
  await this.populate('requesterId', 'username firstName lastName profilePhoto');
  await this.populate('requestedUserId', 'username firstName lastName profilePhoto');
  return this;
};

// Static method to get offers by user (as requester or requested)
swapOfferSchema.statics.getOffersByUser = async function(userId) {
  return await this.find({
    $or: [{ requesterId: userId }, { requestedUserId: userId }],
    isActive: true
  }).populate('requesterId', 'username firstName lastName profilePhoto')
    .populate('requestedUserId', 'username firstName lastName profilePhoto')
    .sort({ createdAt: -1 });
};

// Static method to get pending offers for a user
swapOfferSchema.statics.getPendingOffersForUser = async function(userId) {
  return await this.find({
    requestedUserId: userId,
    status: 'pending',
    isActive: true
  }).populate('requesterId', 'username firstName lastName profilePhoto skillsOffered skillsWanted')
    .sort({ createdAt: -1 });
};

// Static method to get all offers for a user with metadata
swapOfferSchema.statics.getOffersForUserWithMetadata = async function(userId, options = {}) {
  const { status, type, limit = 20, page = 1 } = options;
  
  let query = { 
    isActive: true,
    $or: [{ requesterId: userId }, { requestedUserId: userId }]
  };

  // Filter by status
  if (status && ['pending', 'accepted', 'rejected', 'cancelled'].includes(status)) {
    query.status = status;
  }

  // Filter by type (sent or received)
  if (type === 'sent') {
    query = { ...query, requesterId: userId };
  } else if (type === 'received') {
    query = { ...query, requestedUserId: userId };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const swapOffers = await this.find(query)
    .populate('requesterId', 'username firstName lastName profilePhoto')
    .populate('requestedUserId', 'username firstName lastName profilePhoto')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  // Add metadata to each offer
  const offersWithMetadata = swapOffers.map(offer => {
    const isRequester = offer.requesterId._id.toString() === userId;
    return {
      ...offer.toObject(),
      userRole: isRequester ? 'requester' : 'requested',
      otherUser: isRequester ? offer.requestedUserId : offer.requesterId
    };
  });

  return offersWithMetadata;
};

module.exports = mongoose.model('SwapOffer', swapOfferSchema); 