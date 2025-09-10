const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.trim() === '' || process.env.MONGODB_URI.includes('username:password')) {
      console.log('🔧 Development Mode: Running without MongoDB connection');
      console.log('   💡 To enable database features, configure MONGODB_URI in .env file');
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
