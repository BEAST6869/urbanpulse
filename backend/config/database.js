const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('username:password')) {
      console.warn('⚠️  MongoDB URI not configured. Please update .env file with your MongoDB Atlas connection string.');
      console.warn('   Server will start but database operations will fail until configured.');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.warn('   Server will continue running. Please check your MongoDB configuration.');
    // Don't exit the process - allow server to start for testing
  }
};

module.exports = connectDB;
