const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/feedback
// @desc    Submit feedback and rating for a user
// @access  Public (for testing)
router.post('/', [
  body('userId')
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('message')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters'),
  body('fromUserId')
    .optional()
    .isMongoId()
    .withMessage('From user ID must be a valid MongoDB ObjectId'),
  body('swapOfferId')
    .optional()
    .isMongoId()
    .withMessage('Swap offer ID must be a valid MongoDB ObjectId')
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

    const { userId, rating, message, fromUserId, swapOfferId } = req.body;

    // Find the user to rate
    const userToRate = await User.findById(userId);
    if (!userToRate) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!userToRate.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    // Add rating to the user
    userToRate.addRating(rating, message || '', fromUserId || null, swapOfferId || null);
    await userToRate.save();

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
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

// @route   GET /api/feedback/user/:userId
// @desc    Get all feedback for a specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
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
      message: 'User feedback retrieved successfully',
      feedback: ratingHistory,
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
    console.error('Get user feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user feedback'
    });
  }
});

module.exports = router; 