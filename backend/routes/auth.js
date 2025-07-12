const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
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
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required'),
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
      firstName,
      lastName,
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
router.post('/login', [
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

module.exports = router; 