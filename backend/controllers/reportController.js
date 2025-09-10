const Report = require('../models/Report');
const { deleteImage } = require('../config/cloudinary');

// Create a new report
const createReport = async (req, res) => {
  try {
    const { title, description, category, priority, location, address, reporter } = req.body;
    
    // Parse location if it's a string
    let parsedLocation;
    if (typeof location === 'string') {
      parsedLocation = JSON.parse(location);
    } else {
      parsedLocation = location;
    }

    // Use authenticated user info if available, otherwise use reporter from request
    let parsedReporter;
    if (req.user) {
      // Use authenticated user's information
      parsedReporter = {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || ''
      };
    } else if (typeof reporter === 'string') {
      parsedReporter = JSON.parse(reporter);
    } else {
      parsedReporter = reporter;
    }

    // Process uploaded images
    const images = req.files ? req.files.map(file => ({
      url: file.path,
      publicId: file.filename
    })) : [];

    const reportData = {
      title,
      description,
      category,
      priority,
      location: parsedLocation,
      address,
      reporter: parsedReporter,
      images,
      userId: req.user ? req.user.id : null // Link to user if authenticated
    };

    const report = new Report(reportData);
    await report.save();

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: report
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create report',
      error: error.message
    });
  }
};

// Get all reports with filtering and pagination
const getReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      lat,
      lng,
      radius = 1000
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    let query;

    // If location parameters are provided, use geospatial query
    if (lat && lng) {
      query = Report.findNearby(parseFloat(lng), parseFloat(lat), parseInt(radius));
      query = query.find(filter);
    } else {
      query = Report.find(filter);
    }

    // Apply pagination and sorting
    const reports = await query
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('assignedTo', 'name email');

    // Get total count for pagination
    const total = await Report.countDocuments(filter);

    res.json({
      success: true,
      data: reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message
    });
  }
};

// Get a single report by ID
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await Report.findById(id).populate('assignedTo', 'name email');
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
      error: error.message
    });
  }
};

// Update report status
const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, notes } = req.body;

    const report = await Report.findById(id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Update status using the model method
    await report.updateStatus(status, assignedTo);

    // Add notes if provided
    if (notes) {
      report.notes.push({
        content: notes,
        addedBy: req.user?.name || 'System', // Assuming auth middleware sets req.user
        addedAt: new Date()
      });
      await report.save();
    }

    const updatedReport = await Report.findById(id).populate('assignedTo', 'name email');

    res.json({
      success: true,
      message: 'Report status updated successfully',
      data: updatedReport
    });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report status',
      error: error.message
    });
  }
};

// Get statistics
const getStats = async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    // Calculate date range based on timeframe
    const now = new Date();
    let startDate;
    
    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Aggregation pipeline for comprehensive stats
    const stats = await Report.aggregate([
      {
        $facet: {
          // Overall counts
          totalStats: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
                pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
                rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
              }
            }
          ],
          
          // Reports by category
          categoryStats: [
            {
              $group: {
                _id: '$category',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } }
          ],
          
          // Reports by priority
          priorityStats: [
            {
              $group: {
                _id: '$priority',
                count: { $sum: 1 }
              }
            }
          ],
          
          // Recent reports (within timeframe)
          recentStats: [
            {
              $match: {
                createdAt: { $gte: startDate }
              }
            },
            {
              $group: {
                _id: null,
                recentTotal: { $sum: 1 },
                recentResolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
              }
            }
          ],
          
          // Daily report counts for the last 30 days
          dailyStats: [
            {
              $match: {
                createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
              }
            },
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' },
                  day: { $dayOfMonth: '$createdAt' }
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
          ],
          
          // Average resolution time
          avgResolutionTime: [
            {
              $match: {
                status: 'resolved',
                resolvedAt: { $exists: true }
              }
            },
            {
              $project: {
                resolutionTime: {
                  $divide: [
                    { $subtract: ['$resolvedAt', '$createdAt'] },
                    1000 * 60 * 60 * 24 // Convert to days
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                avgResolutionDays: { $avg: '$resolutionTime' }
              }
            }
          ]
        }
      }
    ]);

    const result = stats[0];
    
    // Format the response
    const formattedStats = {
      overview: result.totalStats[0] || {
        total: 0,
        resolved: 0,
        pending: 0,
        inProgress: 0,
        rejected: 0
      },
      categories: result.categoryStats,
      priorities: result.priorityStats,
      recent: result.recentStats[0] || { recentTotal: 0, recentResolved: 0 },
      dailyTrend: result.dailyStats,
      avgResolutionTime: result.avgResolutionTime[0]?.avgResolutionDays || 0
    };

    // Calculate resolution rate
    const overview = formattedStats.overview;
    if (overview.total > 0) {
      formattedStats.overview.resolutionRate = ((overview.resolved / overview.total) * 100).toFixed(1);
    } else {
      formattedStats.overview.resolutionRate = 0;
    }

    res.json({
      success: true,
      data: formattedStats,
      timeframe
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  getStats
};
