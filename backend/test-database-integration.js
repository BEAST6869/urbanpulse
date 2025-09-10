const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Report = require('./models/Report');
const aiService = require('./services/aiClassificationService');

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://localhost:27017/urbanpulse-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Test database integration with enhanced AI classification
const testDatabaseIntegration = async () => {
  console.log('🧪 Testing Database Integration with Enhanced AI Classification...\n');
  
  try {
    // Connect to database
    const dbConnected = await connectDB();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }
    
    // Initialize AI service
    console.log('🔧 Initializing AI service...');
    await aiService.initialize();
    console.log('✅ AI service initialized\n');
    
    // Load test image
    const imagePath = path.join(__dirname, 'pothole-test.jpg');
    if (!fs.existsSync(imagePath)) {
      throw new Error('Test image not found. Please run create-test-pothole.js first');
    }
    
    const imageBuffer = fs.readFileSync(imagePath);
    console.log(`📷 Loaded test image: ${imageBuffer.length} bytes\n`);
    
    // Classify image
    console.log('🧠 Classifying image with enhanced AI service...');
    const classification = await aiService.classifyImage(imageBuffer);
    console.log('✅ Image classified successfully\n');
    
    console.log('📊 Classification Results:');
    console.log(`   Category: ${classification.category}`);
    console.log(`   Backend Category: ${classification.backendCategory}`);
    console.log(`   Confidence: ${(classification.confidence * 100).toFixed(2)}%`);
    console.log(`   Source: ${classification.source}`);
    console.log(`   Processing Time: ${classification.processingTime}ms`);
    console.log(`   Features Count: ${Object.keys(classification.features || {}).length}\n`);
    
    // Create test report with AI classification
    console.log('📝 Creating test report with AI classification data...');
    
    const testReport = new Report({
      title: 'Test Pothole Report with Enhanced AI',
      description: 'This is a test report to verify database integration with the enhanced AI classification system.',
      category: classification.backendCategory,
      priority: 'medium',
      location: {
        type: 'Point',
        coordinates: [-74.006, 40.7128] // NYC coordinates
      },
      address: '123 Test Street, New York, NY 10001',
      reporter: {
        name: 'Test Reporter',
        email: 'test@example.com',
        phone: '+1-555-0123'
      },
      images: [{
        url: 'test://pothole-test.jpg',
        publicId: 'test-pothole-image',
        uploadedAt: new Date()
      }],
      aiMetadata: {
        // Basic classification results
        aiCategory: classification.category,
        backendCategory: classification.backendCategory,
        confidence: classification.confidence,
        autoClassified: true,
        threshold: classification.threshold,
        
        // Enhanced data
        source: classification.source,
        processingTime: classification.processingTime,
        allPredictions: classification.allPredictions,
        features: classification.features,
        
        // Metadata
        classifiedAt: new Date(),
        modelVersion: 'v2.0.0-tensorflow-enhanced'
      }
    });
    
    const savedReport = await testReport.save();
    console.log(`✅ Report saved successfully with ID: ${savedReport._id}\n`);
    
    // Verify the saved report
    console.log('🔍 Verifying saved report...');
    const retrievedReport = await Report.findById(savedReport._id);
    
    if (retrievedReport && retrievedReport.aiMetadata) {
      console.log('✅ Report retrieved successfully with AI metadata:');
      console.log(`   AI Category: ${retrievedReport.aiMetadata.aiCategory}`);
      console.log(`   Confidence: ${(retrievedReport.aiMetadata.confidence * 100).toFixed(2)}%`);
      console.log(`   Features Stored: ${retrievedReport.aiMetadata.features ? 'Yes' : 'No'}`);
      console.log(`   All Predictions Stored: ${retrievedReport.aiMetadata.allPredictions ? retrievedReport.aiMetadata.allPredictions.length : 0} items`);
      console.log(`   Processing Time: ${retrievedReport.aiMetadata.processingTime}ms`);
      console.log(`   Model Version: ${retrievedReport.aiMetadata.modelVersion}`);
      console.log(`   Classified At: ${retrievedReport.aiMetadata.classifiedAt}`);
      
      // Check specific features
      if (retrievedReport.aiMetadata.features) {
        console.log('\\n📊 Stored Image Features:');
        const features = retrievedReport.aiMetadata.features;
        console.log(`   Brightness: ${features.brightness?.toFixed(4) || 'N/A'}`);
        console.log(`   Contrast: ${features.contrast?.toFixed(4) || 'N/A'}`);
        console.log(`   Dark Pixel Ratio: ${features.darkPixelRatio?.toFixed(4) || 'N/A'}`);
        console.log(`   Surface Type: ${features.surfaceType || 'N/A'}`);
        console.log(`   Dominant Color: ${features.colorDistribution?.dominantColor || 'N/A'}`);
      }
      
      console.log('\\n🎉 Database integration test completed successfully!');
      
      // Test queries
      console.log('\\n🔍 Testing AI-enhanced database queries...');
      
      // Query by AI category
      const potholeReports = await Report.find({ 'aiMetadata.aiCategory': 'pothole' });
      console.log(`   Found ${potholeReports.length} pothole reports`);
      
      // Query by confidence level
      const highConfidenceReports = await Report.find({ 
        'aiMetadata.confidence': { $gte: 0.8 } 
      });
      console.log(`   Found ${highConfidenceReports.length} high-confidence reports`);
      
      // Query by surface type
      const asphaltReports = await Report.find({ 
        'aiMetadata.features.surfaceType': 'asphalt' 
      });
      console.log(`   Found ${asphaltReports.length} reports on asphalt surfaces`);
      
    } else {
      console.error('❌ Report retrieved but missing AI metadata');
    }
    
    // Clean up test data
    console.log('\\n🧹 Cleaning up test data...');
    await Report.findByIdAndDelete(savedReport._id);
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Database integration test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 Database connection closed');
    }
  }
};

// Run the test
testDatabaseIntegration();
