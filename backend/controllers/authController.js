const { validationResult } = require('express-validator');
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Create email transporter
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Register new user
const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, password, phone, role, department } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address'
      });
    }

    // Create user
    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: role || 'citizen'
    };

    // Add department if user is municipal worker
    if (role === 'municipal_worker' && department) {
      userData.department = department;
    }

    const user = await User.create(userData);

    // Generate email verification token
    const emailToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto.createHash('sha256').update(emailToken).digest('hex');
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    // Send verification email (in production)
    if (process.env.NODE_ENV === 'production') {
      try {
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${emailToken}`;
        
        const transporter = createEmailTransporter();
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: 'UrbanPulse - Verify Your Email Address',
          html: `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
              <h2 style="color: #2563eb;">Welcome to UrbanPulse!</h2>
              <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
              <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Verify Email Address
              </a>
              <p style="margin-top: 20px; color: #6b7280;">
                This link will expire in 24 hours. If you didn't create this account, please ignore this email.
              </p>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail registration if email fails
      }
    }

    // Generate token
    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findByCredentials(email, password);
      const token = user.generateAuthToken();

      res.json({
        success: true,
        message: 'Login successful',
        token,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const allowedUpdates = ['name', 'phone', 'address', 'profile'];
    const updates = {};

    // Filter allowed updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash the token to match stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Update user
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Logout (client-side token removal)
const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  verifyEmail,
  logout
};
