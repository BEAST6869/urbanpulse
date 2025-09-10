const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  classifyImage,
  getModelInfo
} = require('../controllers/classificationController');

// Configure multer for image uploads (memory storage for classification)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Middleware for handling multer errors
const handleMulterError = (err, req, res, next) => {
  if (err) {
    return res.status(400).json({
      success: false,
      message: 'File upload error',
      error: err.message
    });
  }
  next();
};

// @route   POST /api/classify
// @desc    Classify an uploaded image using AI model
// @access  Public
router.post('/', upload.single('image'), handleMulterError, classifyImage);

// @route   GET /api/classify/model-info
// @desc    Get AI model information and status
// @access  Public
router.get('/model-info', getModelInfo);

module.exports = router;
