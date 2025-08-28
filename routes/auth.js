const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const User = require('../models/User');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

function toBase64(buffer, mimetype) {
  return `data:${mimetype};base64,${buffer.toString('base64')}`;
}

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user (supports JSON and form-data with file upload)
// @access  Public
router.post('/register', upload.single('profilePhoto'), [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .optional()
    .isString()
    .withMessage('First name must be a string'),
  body('lastName')
    .optional()
    .isString()
    .withMessage('Last name must be a string'),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('skillsOffered')
    .optional()
    .custom((value, { req }) => {
      if (!value) return true;
      if (Array.isArray(value)) return true;
      if (typeof value === 'string') return true; // Accept comma-separated string
      throw new Error('skillsOffered must be an array of strings or a comma-separated string');
    }),
  body('skillsWanted')
    .optional()
    .custom((value, { req }) => {
      if (!value) return true;
      if (Array.isArray(value)) return true;
      if (typeof value === 'string') return true;
      throw new Error('skillsWanted must be an array of strings or a comma-separated string');
    }),
  body('availability')
    .optional()
    .isString()
    .withMessage('Availability must be a string'),
  body('profileVisibility')
    .optional()
    .isIn(['public', 'private'])
    .withMessage('Profile visibility must be either public or private'),
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

    // Accept both JSON and form-data
    const { username, email, password, firstName, lastName, location, skillsOffered, skillsWanted, availability, profileVisibility } = req.body;
    let profilePhoto = req.body.profilePhoto || null;

    // If file is uploaded, convert to base64
    if (req.file) {
      profilePhoto = toBase64(req.file.buffer, req.file.mimetype);
    }

    // Store skillsOffered and skillsWanted as strings
    const skillsOfferedStr = skillsOffered ? String(skillsOffered) : '';
    const skillsWantedStr = skillsWanted ? String(skillsWanted) : '';

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName: firstName || '',
      lastName: lastName || '',
      location: location || '',
      profilePhoto: profilePhoto || null,
      skillsOffered: skillsOfferedStr,
      skillsWanted: skillsWantedStr,
      availability: availability || '',
      profileVisibility: profileVisibility || 'public'
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', multer().none(), [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
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

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/user/:id
// @desc    Get user data by OID
// @access  Public
router.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Find user by ID
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    // Check profile visibility
    if (user.profileVisibility === 'private') {
      return res.status(403).json({
        success: false,
        message: 'User profile is private'
      });
    }

    // Return public profile data
    res.json({
      success: true,
      message: 'User data retrieved successfully',
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user data'
    });
  }
});

// @route   PUT /api/auth/user/:id
// @desc    Update user details (profile edit)
// @access  Public (should be protected in production)
router.put('/user/:id', upload.single('profilePhoto'), [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('firstName')
    .optional()
    .isString()
    .withMessage('First name must be a string'),
  body('lastName')
    .optional()
    .isString()
    .withMessage('Last name must be a string'),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('skillsOffered')
    .optional()
    .custom((value, { req }) => {
      if (!value) return true;
      if (Array.isArray(value)) return true;
      if (typeof value === 'string') return true;
      throw new Error('skillsOffered must be an array of strings or a comma-separated string');
    }),
  body('skillsWanted')
    .optional()
    .custom((value, { req }) => {
      if (!value) return true;
      if (Array.isArray(value)) return true;
      if (typeof value === 'string') return true;
      throw new Error('skillsWanted must be an array of strings or a comma-separated string');
    }),
  body('availability')
    .optional()
    .isString()
    .withMessage('Availability must be a string'),
  body('profileVisibility')
    .optional()
    .isIn(['public', 'private'])
    .withMessage('Profile visibility must be either public or private'),
], async (req, res) => {
  try {
    const { id } = req.params;
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    // Find user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    if (!user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User account is deactivated'
      });
    }
    // Accept both JSON and form-data
    const updateFields = {};
    const allowedFields = [
      'username', 'email', 'firstName', 'lastName', 'location',
      'skillsOffered', 'skillsWanted', 'availability', 'profileVisibility'
    ];
    allowedFields.forEach(field => {
      if (typeof req.body[field] !== 'undefined') {
        if (field === 'skillsOffered' || field === 'skillsWanted') {
          updateFields[field] = String(req.body[field]);
        } else {
          updateFields[field] = req.body[field];
        }
      }
    });
    // If file is uploaded, convert to base64
    if (req.file) {
      updateFields.profilePhoto = toBase64(req.file.buffer, req.file.mimetype);
    } else if (typeof req.body.profilePhoto !== 'undefined') {
      updateFields.profilePhoto = req.body.profilePhoto;
    }
    // Do not allow password update here
    // Update user
    Object.assign(user, updateFields);
    await user.save();
    res.json({
      success: true,
      message: 'User updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
});

// @route   GET /api/auth/users
// @desc    Get all user public profiles
// @access  Public
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ isActive: true });
    const publicProfiles = users.map(user => user.getPublicProfile());
    res.json({
      success: true,
      message: 'All users retrieved successfully',
      users: publicProfiles
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching all users'
    });
  }
});

module.exports = router; 