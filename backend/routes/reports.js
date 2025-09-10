const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  getStats
} = require('../controllers/reportController');

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

// @route   POST /api/reports
// @desc    Create a new report
// @access  Public
router.post('/', upload.array('images', 5), handleMulterError, createReport);

// @route   GET /api/reports
// @desc    Get all reports with filtering and pagination
// @access  Public
router.get('/', getReports);


// @route   GET /api/reports/:id
// @desc    Get a single report by ID
// @access  Public
router.get('/:id', getReportById);

// @route   PUT /api/reports/:id/status
// @desc    Update report status
// @access  Private (would require auth in production)
router.put('/:id/status', updateReportStatus);

module.exports = router;
