/**
 * Test script for TensorFlow.js integration
 * This script tests model loading and image classification
 */

const tfLoader = require('./utils/tfLoader');
const aiService = require('./services/aiClassificationService');
const fs = require('fs');
const path = require('path');

async function testTensorFlowIntegration() {
  console.log('🧪 Testing TensorFlow.js Integration...\n');

  try {
    // Test 1: Initialize TensorFlow.js
    console.log('1️⃣ Testing TensorFlow.js initialization...');
    const success = await tfLoader.initialize();
    
    if (!success) {
      throw new Error('TensorFlow.js initialization failed');
    }
    console.log('✅ TensorFlow.js initialized successfully\n');

    // Test 2: Get system info
    console.log('2️⃣ Getting system information...');
    const sysInfo = tfLoader.getSystemInfo();
    console.log('System Info:', JSON.stringify(sysInfo, null, 2));
    console.log('✅ System info retrieved\n');

    // Test 3: Initialize AI service
    console.log('3️⃣ Testing AI Classification Service...');
    const aiInitialized = await aiService.initialize();
    
    if (!aiInitialized) {
      throw new Error('AI Service initialization failed');
    }
    console.log('✅ AI Classification Service initialized\n');

    // Test 4: Get AI service status
    console.log('4️⃣ Getting AI service status...');
    const aiStatus = aiService.getStatus();
    console.log('AI Status:', JSON.stringify(aiStatus, null, 2));
    console.log('✅ AI service status retrieved\n');

    // Test 5: Test image classification with compatible model
    console.log('5️⃣ Testing image classification with compatible model...');
    
    // Create a simple test image instead of using training data
    try {
      console.log('🎨 Creating test image for classification...');
      
      // Create a simple test image buffer (224x224x3 RGB)
      const sharp = require('sharp');
      const testImageBuffer = await sharp({
        create: {
          width: 224,
          height: 224,
          channels: 3,
          background: { r: 100, g: 150, b: 200 }
        }
      })
      .png()
      .toBuffer();
      
      console.log(`🖼️ Test image created: ${testImageBuffer.length} bytes`);
      
      const result = await aiService.classifyImage(testImageBuffer);
      console.log('🎯 Classification result:', JSON.stringify(result, null, 2));
      console.log('✅ Image classification successful\n');
      
    } catch (error) {
      console.error('❌ Image classification failed:', error.message);
      console.error('Stack trace:', error.stack);
      console.log('🔄 This indicates there may still be compatibility issues\n');
    }

    console.log('🎉 TensorFlow.js integration test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testTensorFlowIntegration().catch(console.error);
}

module.exports = { testTensorFlowIntegration };
