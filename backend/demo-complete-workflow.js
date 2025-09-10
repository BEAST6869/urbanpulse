const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Import our modules
const Report = require('./models/Report');
const { classifyImage, getModelInfo } = require('./controllers/classificationController');

// Simulate the complete workflow from image upload to database storage
const demoCompleteWorkflow = async () => {
  console.log('🚀 UrbanPulse Complete Workflow Demonstration');
  console.log('=' .repeat(60));
  console.log('From Image Upload → AI Classification → Database Storage\n');

  try {
    // 1. Connect to database
    console.log('1️⃣ Connecting to database...');
    await mongoose.connect('mongodb://localhost:27017/urbanpulse-demo', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Database connected successfully\n');

    // 2. Get AI model status
    console.log('2️⃣ Checking AI model status...');
    
    // Create a mock request/response for getModelInfo
    const mockReq = {};
    const mockRes = {
      json: (data) => {
        if (data.success) {
          console.log('✅ AI Model Status:', data.data.status);
          console.log(`   Categories: ${data.data.totalCategories}`);
          console.log(`   Engine: ${data.data.engine}`);
          console.log(`   Version: ${data.data.version}`);
          console.log(`   Classification Method: ${data.data.type}\n`);
        }
      },
      status: (code) => ({ json: (data) => console.log(`❌ Error ${code}:`, data) })
    };
    
    await getModelInfo(mockReq, mockRes);

    // 3. Load and classify test image
    console.log('3️⃣ Loading test image...');
    const imagePath = path.join(__dirname, 'pothole-test.jpg');
    
    if (!fs.existsSync(imagePath)) {
      console.log('📸 Test image not found, creating one...');
      // Run the create test image function
      require('./create-test-pothole.js');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for creation
    }
    
    const imageBuffer = fs.readFileSync(imagePath);
    console.log(`✅ Image loaded: ${imageBuffer.length} bytes\n`);

    // 4. Simulate API request for image classification
    console.log('4️⃣ Simulating image classification API call...');
    
    const mockClassificationReq = {
      file: {
        originalname: 'pothole-test.jpg',
        size: imageBuffer.length,
        buffer: imageBuffer,
        mimetype: 'image/jpeg'
      }
    };
    
    let classificationResult = null;
    const mockClassificationRes = {
      json: (data) => {
        if (data.success) {
          classificationResult = data;
          console.log('✅ Image Classification Results:');
          console.log(`   Category: ${data.classification.category}`);
          console.log(`   Backend Category: ${data.classification.backendCategory}`);
          console.log(`   Confidence: ${(data.classification.confidence * 100).toFixed(2)}%`);
          console.log(`   Method: ${data.modelInfo.type}`);
          console.log(`   Features Extracted: ${Object.keys(data.features || {}).length} features\n`);
        }
      },
      status: (code) => ({ json: (data) => console.log(`❌ Classification Error ${code}:`, data) })
    };
    
    await classifyImage(mockClassificationReq, mockClassificationRes);

    if (!classificationResult) {
      throw new Error('Classification failed');
    }

    // 5. Simulate report creation with AI classification
    console.log('5️⃣ Creating report with AI classification data...');
    
    const reportData = {
      title: 'Pothole on Main Street - AI Detected',
      description: 'Large pothole causing vehicle damage. Automatically detected and classified by AI system.',
      category: classificationResult.classification.backendCategory,
      priority: classificationResult.classification.confidence > 0.8 ? 'high' : 'medium',
      location: {
        type: 'Point',
        coordinates: [-74.0060, 40.7128] // NYC coordinates
      },
      address: '456 Main Street, New York, NY 10001',
      reporter: {
        name: 'AI Detection System',
        email: 'ai@urbanpulse.com',
        phone: '+1-555-AI-DETECT'
      },
      images: [{
        url: `file://${imagePath}`,
        publicId: 'ai-detected-pothole-001',
        uploadedAt: new Date()
      }],
      aiMetadata: {
        // Basic classification results
        aiCategory: classificationResult.classification.category,
        backendCategory: classificationResult.classification.backendCategory,
        confidence: classificationResult.classification.confidence,
        autoClassified: true,
        threshold: classificationResult.classification.threshold,
        
        // Enhanced data
        source: 'tensorflow_tensors',
        processingTime: 500, // Simulated
        allPredictions: classificationResult.classification.allPredictions,
        features: classificationResult.features,
        
        // Metadata
        classifiedAt: new Date(),
        modelVersion: 'v2.0.0-tensorflow-enhanced'
      }
    };

    const newReport = new Report(reportData);
    const savedReport = await newReport.save();
    
    console.log(`✅ Report created successfully!`);
    console.log(`   Report ID: ${savedReport._id}`);
    console.log(`   Auto-classified: ${savedReport.aiMetadata.autoClassified}`);
    console.log(`   AI Category: ${savedReport.aiMetadata.aiCategory}`);
    console.log(`   Confidence: ${(savedReport.aiMetadata.confidence * 100).toFixed(2)}%\n`);

    // 6. Demonstrate AI-enhanced database queries
    console.log('6️⃣ Demonstrating AI-enhanced database queries...');
    
    // Query 1: Find all pothole reports
    const potholeReports = await Report.find({ 
      'aiMetadata.aiCategory': 'pothole' 
    }).sort({ 'aiMetadata.confidence': -1 });
    console.log(`   🕳️  Pothole reports found: ${potholeReports.length}`);
    
    // Query 2: Find high-confidence auto-classified reports
    const highConfidenceReports = await Report.find({
      'aiMetadata.autoClassified': true,
      'aiMetadata.confidence': { $gte: 0.7 }
    });
    console.log(`   🎯 High-confidence auto-classified: ${highConfidenceReports.length}`);
    
    // Query 3: Find reports by surface type
    const asphaltReports = await Report.find({
      'aiMetadata.features.surfaceType': 'asphalt'
    });
    console.log(`   🛣️  Asphalt surface reports: ${asphaltReports.length}`);
    
    // Query 4: Analytics - Average confidence by category
    const avgConfidenceStats = await Report.aggregate([
      { $match: { 'aiMetadata.confidence': { $exists: true } } },
      { 
        $group: {
          _id: '$aiMetadata.aiCategory',
          avgConfidence: { $avg: '$aiMetadata.confidence' },
          count: { $sum: 1 }
        }
      },
      { $sort: { avgConfidence: -1 } }
    ]);
    
    console.log('\\n📊 AI Classification Analytics:');
    avgConfidenceStats.forEach(stat => {
      console.log(`   ${stat._id}: ${(stat.avgConfidence * 100).toFixed(1)}% avg confidence (${stat.count} reports)`);
    });

    // 7. Show detailed AI metadata from database
    console.log('\\n7️⃣ Detailed AI metadata stored in database:');
    const reportDetails = await Report.findById(savedReport._id);
    
    console.log('   🧠 AI Analysis Results:');
    if (reportDetails.aiMetadata.features) {
      const features = reportDetails.aiMetadata.features;
      console.log(`      Brightness: ${features.brightness?.toFixed(3)} (0=dark, 1=bright)`);
      console.log(`      Contrast: ${features.contrast?.toFixed(3)}`);
      console.log(`      Dark Pixel Ratio: ${(features.darkPixelRatio * 100)?.toFixed(1)}%`);
      console.log(`      Surface Type: ${features.surfaceType}`);
      console.log(`      Color: ${features.colorDistribution?.dominantColor}`);
      console.log(`      Grayscale Tendency: ${(features.grayscaleTendency * 100)?.toFixed(1)}%`);
    }
    
    console.log('   📈 Alternative Predictions:');
    if (reportDetails.aiMetadata.allPredictions) {
      reportDetails.aiMetadata.allPredictions.slice(0, 3).forEach((pred, i) => {
        const rank = ['🥇', '🥈', '🥉'][i];
        console.log(`      ${rank} ${pred.category}: ${(pred.confidence * 100).toFixed(1)}%`);
      });
    }

    console.log('\\n🎉 Complete workflow demonstration successful!');
    console.log('\\nWorkflow Summary:');
    console.log('✅ Image uploaded and processed');
    console.log('✅ AI classification with enhanced features');
    console.log('✅ Comprehensive metadata stored in database');
    console.log('✅ AI-enhanced queries working');
    console.log('✅ Analytics and reporting capabilities enabled');
    
    // Cleanup
    console.log('\\n🧹 Cleaning up demo data...');
    await Report.findByIdAndDelete(savedReport._id);
    console.log('✅ Demo data cleaned up');

  } catch (error) {
    console.error('❌ Workflow demonstration failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 Database connection closed');
    }
  }
};

// Run the demonstration
demoCompleteWorkflow();
