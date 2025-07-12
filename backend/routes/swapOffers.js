const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const SwapOffer = require('../models/SwapOffer');
const User = require('../models/User');

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

module.exports = router; 