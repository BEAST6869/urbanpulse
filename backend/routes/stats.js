const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/reportController');

// @route   GET /api/stats
// @desc    Get statistics about reports
// @access  Public
router.get('/', getStats);

module.exports = router;
