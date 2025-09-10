const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false // Don't return password in queries by default
  },
  role: {
    type: String,
    enum: ['citizen', 'admin', 'municipal_worker'],
    default: 'citizen'
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[0-9\-\s\(\)]{10,20}$/, 'Please provide a valid phone number']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'USA'
    }
  },
  profile: {
    avatar: {
      url: String,
      publicId: String
    },
    bio: {
      type: String,
      maxlength: 500
    },
    dateOfBirth: Date,
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  department: {
    type: String,
    enum: ['public_works', 'utilities', 'transportation', 'environment', 'safety', 'planning'],
    required: function() {
      return this.role === 'municipal_worker';
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ department: 1 }, { sparse: true });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  const payload = {
    id: this._id,
    email: this.email,
    role: this.role,
    name: this.name
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    throw new Error('Password not available for comparison');
  }
  
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to handle failed login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static method to find user by email with password
userSchema.statics.findByCredentials = async function(email, password) {
  const user = await this.findOne({ 
    email: email.toLowerCase(),
    isActive: true 
  }).select('+password');
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  if (user.isLocked) {
    throw new Error('Account temporarily locked due to too many failed login attempts');
  }
  
  const isPasswordMatch = await user.comparePassword(password);
  
  if (!isPasswordMatch) {
    await user.incLoginAttempts();
    throw new Error('Invalid credentials');
  }
  
  // Reset login attempts on successful login
  if (user.loginAttempts && user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }
  
  // Update last login
  user.lastLogin = new Date();
  await user.save();
  
  return user;
};

// Static method to get user statistics
userSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: { 
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        citizens: { 
          $sum: { $cond: [{ $eq: ['$role', 'citizen'] }, 1, 0] }
        },
        municipalWorkers: { 
          $sum: { $cond: [{ $eq: ['$role', 'municipal_worker'] }, 1, 0] }
        },
        admins: { 
          $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
        },
        verifiedEmails: {
          $sum: { $cond: [{ $eq: ['$isEmailVerified', true] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalUsers: 0,
    activeUsers: 0,
    citizens: 0,
    municipalWorkers: 0,
    admins: 0,
    verifiedEmails: 0
  };
};

module.exports = mongoose.model('User', userSchema);
