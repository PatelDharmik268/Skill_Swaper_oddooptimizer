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
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Completion and feedback fields
  completionStatus: {
    requesterCompleted: {
      type: Boolean,
      default: false
    },
    requestedUserCompleted: {
      type: Boolean,
      default: false
    }
  },
  feedbackGiven: {
    requesterFeedback: {
      type: Boolean,
      default: false
    },
    requestedUserFeedback: {
      type: Boolean,
      default: false
    }
  },
  completedAt: {
    type: Date,
    default: null
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

// Virtual for checking if both users have completed the swap
swapOfferSchema.virtual('isFullyCompleted').get(function() {
  return this.completionStatus.requesterCompleted && this.completionStatus.requestedUserCompleted;
});

// Virtual for checking if both users have given feedback
swapOfferSchema.virtual('isFullyRated').get(function() {
  return this.feedbackGiven.requesterFeedback && this.feedbackGiven.requestedUserFeedback;
});

// Method to get offer details with populated user data
swapOfferSchema.methods.getOfferWithUsers = async function() {
  await this.populate('requesterId', 'username firstName lastName profilePhoto');
  await this.populate('requestedUserId', 'username firstName lastName profilePhoto');
  return this;
};

// Method to mark completion for a user
swapOfferSchema.methods.markCompletion = function(userId) {
  if (this.requesterId.toString() === userId) {
    this.completionStatus.requesterCompleted = true;
  } else if (this.requestedUserId.toString() === userId) {
    this.completionStatus.requestedUserCompleted = true;
  }
  
  // Mark as completed when either user completes (allows for rating)
  this.status = 'completed';
  this.completedAt = new Date();
};

// Method to mark feedback given for a user
swapOfferSchema.methods.markFeedbackGiven = function(userId) {
  if (this.requesterId.toString() === userId) {
    this.feedbackGiven.requesterFeedback = true;
  } else if (this.requestedUserId.toString() === userId) {
    this.feedbackGiven.requestedUserFeedback = true;
  }
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

// Static method to get completed offers that need feedback
swapOfferSchema.statics.getCompletedOffersNeedingFeedback = async function(userId) {
  return await this.find({
    $or: [{ requesterId: userId }, { requestedUserId: userId }],
    status: 'completed',
    isActive: true,
    $or: [
      { 'feedbackGiven.requesterFeedback': false, requesterId: userId },
      { 'feedbackGiven.requestedUserFeedback': false, requestedUserId: userId }
    ]
  }).populate('requesterId', 'username firstName lastName profilePhoto')
    .populate('requestedUserId', 'username firstName lastName profilePhoto')
    .sort({ completedAt: -1 });
};

// Static method to get all offers for a user with metadata
swapOfferSchema.statics.getOffersForUserWithMetadata = async function(userId, options = {}) {
  const { status, type, limit = 20, page = 1 } = options;
  
  let query = { 
    isActive: true,
    $or: [{ requesterId: userId }, { requestedUserId: userId }]
  };

  // Filter by status
  if (status && ['pending', 'accepted', 'rejected', 'cancelled', 'completed'].includes(status)) {
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