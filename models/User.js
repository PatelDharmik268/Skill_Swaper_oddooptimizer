const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters'],
    default: ''
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
    default: ''
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters'],
    default: ''
  },
  profilePhoto: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow null/empty
        // Check if it's a valid base64 string
        return /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(v);
      },
      message: 'Profile photo must be a valid base64 image string'
    }
  },
  // New fields
  skillsOffered: {
    type: String,
    default: ''
  },
  skillsWanted: {
    type: String,
    default: ''
  },
  availability: {
    type: String,
    default: ''
  },
  profileVisibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Rating fields
  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'Average rating cannot be negative'],
    max: [5, 'Average rating cannot exceed 5']
  },
  totalRatings: {
    type: Number,
    default: 0,
    min: [0, 'Total ratings cannot be negative']
  },
  ratingHistory: [{
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [1000, 'Feedback cannot exceed 1000 characters']
    },
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    swapOfferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SwapOffer',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Method to update average rating
userSchema.methods.updateAverageRating = function() {
  if (this.ratingHistory.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
    return;
  }
  
  const totalRating = this.ratingHistory.reduce((sum, rating) => sum + rating.rating, 0);
  this.averageRating = totalRating / this.ratingHistory.length;
  this.totalRatings = this.ratingHistory.length;
};

// Method to add a new rating
userSchema.methods.addRating = function(rating, feedback, fromUserId, swapOfferId) {
  this.ratingHistory.push({
    rating,
    feedback,
    fromUserId,
    swapOfferId
  });
  this.updateAverageRating();
};

module.exports = mongoose.model('User', userSchema);

