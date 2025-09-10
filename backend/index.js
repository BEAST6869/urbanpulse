const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

// Import routes
const reportRoutes = require('./routes/reports');
const statsRoutes = require('./routes/stats');
const authRoutes = require('./routes/auth');

// Import middleware
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const { optionalAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(apiLimiter);

// Optional authentication for all routes (sets req.user if token exists)
app.use(optionalAuth);

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'UrbanPulse Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      reports: '/api/reports',
      stats: '/api/stats',
      health: '/api/health'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'connected',
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/stats', statsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

const server = app.listen(PORT, () => {
  console.log(`UrbanPulse Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 Server started successfully at http://localhost:${PORT}`);
  console.log(`📋 API Documentation available at http://localhost:${PORT}/`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});
