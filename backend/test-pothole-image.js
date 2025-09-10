const fs = require('fs');
const path = require('path');
const AIClassificationService = require('./services/aiClassificationService');

async function testPotholeClassification() {
  console.log('🧪 Testing Pothole Image Classification...\n');

  try {
    // Initialize the AI service
    console.log('🔧 Initializing AI Classification Service...');
    const aiService = AIClassificationService; // It's already a singleton instance
    await aiService.initialize();
    console.log('✅ AI service initialized\n');

    // Check if the pothole image exists
    const imagePath = path.join(__dirname, 'pothole-test.jpg');
    if (!fs.existsSync(imagePath)) {
      console.error('❌ Pothole test image not found at:', imagePath);
      console.log('Please save the pothole image as "pothole-test.jpg" in the backend directory');
      return;
    }

    // Load the image
    console.log('📷 Loading pothole image...');
    const imageBuffer = fs.readFileSync(imagePath);
    console.log(`📊 Image size: ${imageBuffer.length} bytes\n`);

    // Classify the image
    console.log('🧠 Classifying pothole image...');
    const startTime = Date.now();
    const result = await aiService.classifyImage(imageBuffer);
    const totalTime = Date.now() - startTime;

    console.log('🎯 Classification Results:');
    console.log('=' .repeat(50));
    console.log(`🏷️  Predicted Category: ${result.category}`);
    console.log(`🎢 Backend Category: ${result.backendCategory}`);
    console.log(`📈 Confidence: ${result.confidence.toFixed(4)} (${(result.confidence * 100).toFixed(2)}%)`);
    console.log(`⏱️  Processing Time: ${result.processingTime}ms`);
    console.log(`🔍 Classification Method: ${result.source}`);
    console.log(`🎯 Confidence Threshold: ${result.threshold}`);
    console.log(`⏰ Total Time: ${totalTime}ms\n`);

    console.log('📊 Extracted Features:');
    if (result.features) {
      console.log(`   💡 Brightness: ${result.features.brightness.toFixed(4)}`);
      console.log(`   📊 Variance: ${result.features.variance.toFixed(4)}`);
      console.log(`   🔆 Contrast: ${result.features.contrast.toFixed(4)}`);
      console.log(`   🎨 Dominant Color: ${result.features.colorDistribution.dominantColor}`);
      console.log(`   🔴 Red Channel: ${result.features.colorDistribution.red.toFixed(4)}`);
      console.log(`   🟢 Green Channel: ${result.features.colorDistribution.green.toFixed(4)}`);
      console.log(`   🔵 Blue Channel: ${result.features.colorDistribution.blue.toFixed(4)}`);
      console.log(`   🧮 Complexity: ${result.features.complexity.toFixed(4)}\n`);
    }

    console.log('🏆 Top 5 Predictions:');
    result.allPredictions.slice(0, 5).forEach((pred, index) => {
      const icon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
      console.log(`   ${icon} ${pred.category}: ${(pred.confidence * 100).toFixed(2)}% (${pred.backendCategory})`);
    });

    // Analysis
    console.log('\n🔍 Analysis:');
    const isPotholeCorrect = result.category === 'pothole' || 
                            (result.allPredictions[0]?.category === 'pothole' && result.allPredictions[0]?.confidence > 0.3);
    
    if (isPotholeCorrect) {
      console.log('✅ SUCCESS: The image was correctly classified as pothole-related!');
    } else {
      console.log('⚠️  The image was not classified as pothole. Let\'s analyze why:');
      
      const potholePredict = result.allPredictions.find(p => p.category === 'pothole');
      if (potholePredict) {
        console.log(`   • Pothole confidence was ${(potholePredict.confidence * 100).toFixed(2)}% (rank ${result.allPredictions.indexOf(potholePredict) + 1})`);
      } else {
        console.log('   • Pothole was not in the prediction list');
      }
      
      console.log(`   • Top prediction: ${result.allPredictions[0]?.category} at ${(result.allPredictions[0]?.confidence * 100).toFixed(2)}%`);
      console.log(`   • Confidence threshold: ${(result.threshold * 100)}%`);
    }

    console.log('\n🎉 Pothole classification test completed!');
    
  } catch (error) {
    console.error('❌ Error during pothole classification test:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testPotholeClassification();
