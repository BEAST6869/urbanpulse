const express = require('express');
const { body } = require('express-validator');
const { register, login, getProfile, updateProfile, changePassword, verifyEmail, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const registerValidation = [
  body('name').isString().isLength({ min: 2 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['citizen', 'admin', 'municipal_worker']).withMessage('Invalid role'),
  body('department').optional().isString()
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isString().withMessage('Password is required')
];

const updateProfileValidation = [
  body('name').optional().isString().isLength({ min: 2 }),
  body('phone').optional().isString(),
  body('address').optional().isObject(),
  body('profile').optional().isObject()
];

const changePasswordValidation = [
  body('currentPassword').isString().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfileValidation, updateProfile);
router.put('/me/password', protect, changePasswordValidation, changePassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/logout', protect, logout);

module.exports = router;
