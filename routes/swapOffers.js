const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const SwapOffer = require('../models/SwapOffer');
const User = require('../models/User');
const { sendSkillExchangeInvitation } = require('../services/emailService');

const router = express.Router();

// @route   POST /api/swap-offers
// @desc    Create a new swap offer
// @access  Public (for testing)
router.post('/', [
  body('requesterId')
    .isMongoId()
    .withMessage('Requester ID must be a valid MongoDB ObjectId'),
  body('requestedUserId')
    .isMongoId()
    .withMessage('Requested user ID must be a valid MongoDB ObjectId'),
  body('message')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('offeredSkills')
    .isLength({ min: 1, max: 500 })
    .withMessage('Offered skills must be between 1 and 500 characters'),
  body('wantedSkills')
    .isLength({ min: 1, max: 500 })
    .withMessage('Wanted skills must be between 1 and 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { requesterId, requestedUserId, message, offeredSkills, wantedSkills } = req.body;

    // Check if requester and requested user are the same
    if (requesterId === requestedUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create swap offer to yourself'
      });
    }

    // Verify both users exist and are active
    const [requester, requestedUser] = await Promise.all([
      User.findById(requesterId),
      User.findById(requestedUserId)
    ]);

    if (!requester || !requester.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Requester not found or inactive'
      });
    }

    if (!requestedUser || !requestedUser.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Requested user not found or inactive'
      });
    }

    // Check if there's already a pending offer between these users
    const existingOffer = await SwapOffer.findOne({
      $or: [
        { requesterId, requestedUserId, status: 'pending', isActive: true },
        { requesterId: requestedUserId, requestedUserId: requesterId, status: 'pending', isActive: true }
      ]
    });

    if (existingOffer) {
      return res.status(400).json({
        success: false,
        message: 'A pending swap offer already exists between these users'
      });
    }

    // Create new swap offer
    const swapOffer = new SwapOffer({
      requesterId,
      requestedUserId,
      message,
      offeredSkills,
      wantedSkills
    });

    await swapOffer.save();

    // Populate user data for response
    await swapOffer.getOfferWithUsers();

    // Send email notification to the requested user
    try {
      const invitationData = {
        recipientEmail: requestedUser.email,
        recipientName: requestedUser.firstName || requestedUser.username,
        senderName: requester.firstName || requester.username,
        senderUsername: requester.username,
        offeredSkills: offeredSkills.split(',').map(s => s.trim()),
        wantedSkills: wantedSkills.split(',').map(s => s.trim()),
        message: message,
        invitationLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/swap-requests`
      };

      const emailResult = await sendSkillExchangeInvitation(invitationData);
      if (emailResult.success) {
        console.log('Email notification sent successfully');
      } else {
        console.error('Failed to send email notification:', emailResult.error);
      }
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Swap offer created successfully',
      swapOffer
    });

  } catch (error) {
    console.error('Create swap offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating swap offer'
    });
  }
});

// @route   GET /api/swap-offers
// @desc    Get all swap offers (with optional filters)
// @access  Public (for testing)
router.get('/', async (req, res) => {
  try {
    const { userId, status, limit = 20, page = 1 } = req.query;

    let query = { isActive: true };

    // Filter by user (as requester or requested)
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format'
        });
      }
      query.$or = [{ requesterId: userId }, { requestedUserId: userId }];
    }

    // Filter by status
    if (status && ['pending', 'accepted', 'rejected', 'cancelled'].includes(status)) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const swapOffers = await SwapOffer.find(query)
      .populate('requesterId', 'username firstName lastName profilePhoto')
      .populate('requestedUserId', 'username firstName lastName profilePhoto')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await SwapOffer.countDocuments(query);

    res.json({
      success: true,
      message: 'Swap offers retrieved successfully',
      swapOffers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get swap offers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching swap offers'
    });
  }
});

// @route   GET /api/swap-offers/:id
// @desc    Get swap offer by ID
// @access  Public (for testing)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid swap offer ID format'
      });
    }

    const swapOffer = await SwapOffer.findById(id)
      .populate('requesterId', 'username firstName lastName profilePhoto skillsOffered skillsWanted')
      .populate('requestedUserId', 'username firstName lastName profilePhoto skillsOffered skillsWanted');

    if (!swapOffer || !swapOffer.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Swap offer not found'
      });
    }

    res.json({
      success: true,
      message: 'Swap offer retrieved successfully',
      swapOffer
    });

  } catch (error) {
    console.error('Get swap offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching swap offer'
    });
  }
});

// @route   PUT /api/swap-offers/:id/complete
// @desc    Mark a swap offer as completed by a user
// @access  Public (for testing)
router.put('/:id/complete', [
  body('userId')
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid swap offer ID format'
      });
    }

    const swapOffer = await SwapOffer.findById(id);

    if (!swapOffer || !swapOffer.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Swap offer not found'
      });
    }

    // Check if user is part of this swap
    if (swapOffer.requesterId.toString() !== userId && swapOffer.requestedUserId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this swap offer'
      });
    }

    // Only allow completion if offer is accepted
    if (swapOffer.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Can only complete accepted offers'
      });
    }

    // Mark completion for the user
    swapOffer.markCompletion(userId);
    await swapOffer.save();

    // Populate user data for response
    await swapOffer.getOfferWithUsers();

    res.json({
      success: true,
      message: 'Swap completion marked successfully',
      swapOffer
    });

  } catch (error) {
    console.error('Mark completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking completion'
    });
  }
});

// @route   PUT /api/swap-offers/:id/status
// @desc    Update swap offer status (accept/reject/cancel)
// @access  Public (for testing)
router.put('/:id/status', [
  body('status')
    .isIn(['accepted', 'rejected', 'cancelled'])
    .withMessage('Status must be accepted, rejected, or cancelled'),
  body('userId')
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status, userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid swap offer ID format'
      });
    }

    const swapOffer = await SwapOffer.findById(id);

    if (!swapOffer || !swapOffer.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Swap offer not found'
      });
    }

    // Check if user is authorized to update this offer
    if (swapOffer.requesterId.toString() !== userId && swapOffer.requestedUserId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this swap offer'
      });
    }

    // Only allow status updates if offer is pending
    if (swapOffer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only update status of pending offers'
      });
    }

    // Update the status
    swapOffer.status = status;
    await swapOffer.save();

    // Populate user data for response
    await swapOffer.getOfferWithUsers();

    res.json({
      success: true,
      message: `Swap offer ${status} successfully`,
      swapOffer
    });

  } catch (error) {
    console.error('Update swap offer status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating swap offer status'
    });
  }
});

// @route   DELETE /api/swap-offers/:id
// @desc    Delete (deactivate) swap offer
// @access  Public (for testing)
router.delete('/:id', [
  body('userId')
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid swap offer ID format'
      });
    }

    const swapOffer = await SwapOffer.findById(id);

    if (!swapOffer || !swapOffer.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Swap offer not found'
      });
    }

    // Check if user is authorized to delete this offer
    if (swapOffer.requesterId.toString() !== userId && swapOffer.requestedUserId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this swap offer'
      });
    }

    // Soft delete by setting isActive to false
    swapOffer.isActive = false;
    await swapOffer.save();

    res.json({
      success: true,
      message: 'Swap offer deleted successfully'
    });

  } catch (error) {
    console.error('Delete swap offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting swap offer'
    });
  }
});

// @route   GET /api/swap-offers/user/:userId/pending
// @desc    Get pending swap offers for a specific user
// @access  Public (for testing)
router.get('/user/:userId/pending', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const pendingOffers = await SwapOffer.getPendingOffersForUser(userId);

    res.json({
      success: true,
      message: 'Pending swap offers retrieved successfully',
      pendingOffers
    });

  } catch (error) {
    console.error('Get pending offers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending offers'
    });
  }
});

// @route   GET /api/swap-offers/user/:userId
// @desc    Get all swap offers for a specific user (both sent and received)
// @access  Public (for testing)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, type, limit = 20, page = 1 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const options = { status, type, limit, page };
    const swapOffers = await SwapOffer.getOffersForUserWithMetadata(userId, options);

    // Get total count for pagination
    let countQuery = {
      isActive: true,
      $or: [{ requesterId: userId }, { requestedUserId: userId }]
    };

    if (status && ['pending', 'accepted', 'rejected', 'cancelled'].includes(status)) {
      countQuery.status = status;
    }

    if (type === 'sent') {
      countQuery = { ...countQuery, requesterId: userId };
    } else if (type === 'received') {
      countQuery = { ...countQuery, requestedUserId: userId };
    }

    const total = await SwapOffer.countDocuments(countQuery);

    res.json({
      success: true,
      message: 'Swap offers retrieved successfully',
      swapOffers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get user swap offers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user swap offers'
    });
  }
});

// @route   GET /api/swap-offers/users/available
// @desc    Get all available users for swap requests (public profiles only)
// @access  Public
router.get('/users/available', async (req, res) => {
  try {
    const { limit = 20, page = 1, search } = req.query;

    let query = {
      isActive: true,
      profileVisibility: 'public'
    };

    // Add search functionality
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { skillsOffered: { $regex: search, $options: 'i' } },
        { skillsWanted: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('username firstName lastName profilePhoto skillsOffered skillsWanted location availability')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      message: 'Available users retrieved successfully',
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get available users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching available users'
    });
  }
});

// @route   POST /api/swap-offers/:id/feedback
// @desc    Submit feedback and rating for a completed swap
// @access  Public (for testing)
router.post('/:id/feedback', [
  body('userId')
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('feedback')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Feedback cannot exceed 1000 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { userId, rating, feedback } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid swap offer ID format'
      });
    }

    const swapOffer = await SwapOffer.findById(id);

    if (!swapOffer || !swapOffer.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Swap offer not found'
      });
    }

    // Check if user is part of this swap
    if (swapOffer.requesterId.toString() !== userId && swapOffer.requestedUserId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit feedback for this swap offer'
      });
    }

    // Only allow feedback for completed offers
    if (swapOffer.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only submit feedback for completed offers'
      });
    }

    // Check if user has already given feedback
    const hasGivenFeedback = swapOffer.requesterId.toString() === userId 
      ? swapOffer.feedbackGiven.requesterFeedback 
      : swapOffer.feedbackGiven.requestedUserFeedback;

    if (hasGivenFeedback) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted feedback for this swap'
      });
    }

    // Determine which user to rate (the other user in the swap)
    const userToRateId = swapOffer.requesterId.toString() === userId 
      ? swapOffer.requestedUserId 
      : swapOffer.requesterId;

    // Add rating to the user being rated
    const userToRate = await User.findById(userToRateId);
    if (!userToRate) {
      return res.status(404).json({
        success: false,
        message: 'User to rate not found'
      });
    }

    userToRate.addRating(rating, feedback || '', userId, swapOffer._id);
    await userToRate.save();

    // Mark feedback as given in the swap offer
    swapOffer.markFeedbackGiven(userId);
    await swapOffer.save();

    // Populate user data for response
    await swapOffer.getOfferWithUsers();

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      swapOffer,
      updatedUserRating: {
        averageRating: userToRate.averageRating,
        totalRatings: userToRate.totalRatings
      }
    });

  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting feedback'
    });
  }
});

// @route   GET /api/swap-offers/user/:userId/needing-feedback
// @desc    Get completed swap offers that need feedback from a user
// @access  Public (for testing)
router.get('/user/:userId/needing-feedback', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const swapOffers = await SwapOffer.getCompletedOffersNeedingFeedback(userId);

    res.json({
      success: true,
      message: 'Swap offers needing feedback retrieved successfully',
      swapOffers
    });

  } catch (error) {
    console.error('Get offers needing feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching offers needing feedback'
    });
  }
});

// @route   GET /api/users/:userId/ratings
// @desc    Get all ratings and feedback for a user
// @access  Public
router.get('/users/:userId/ratings', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get paginated rating history with populated user data
    const ratingHistory = await User.aggregate([
      { $match: { _id: user._id } },
      { $unwind: '$ratingHistory' },
      { $sort: { 'ratingHistory.createdAt': -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: 'ratingHistory.fromUserId',
          foreignField: '_id',
          as: 'fromUser'
        }
      },
      {
        $lookup: {
          from: 'swapoffers',
          localField: 'ratingHistory.swapOfferId',
          foreignField: '_id',
          as: 'swapOffer'
        }
      },
      {
        $project: {
          rating: '$ratingHistory.rating',
          feedback: '$ratingHistory.feedback',
          createdAt: '$ratingHistory.createdAt',
          fromUser: { $arrayElemAt: ['$fromUser', 0] },
          swapOffer: { $arrayElemAt: ['$swapOffer', 0] }
        }
      }
    ]);

    const total = user.ratingHistory.length;

    res.json({
      success: true,
      message: 'User ratings retrieved successfully',
      ratings: ratingHistory,
      userStats: {
        averageRating: user.averageRating,
        totalRatings: user.totalRatings
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get user ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user ratings'
    });
  }
});

module.exports = router; 