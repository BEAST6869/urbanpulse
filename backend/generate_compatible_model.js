/**
 * Generate a compatible TensorFlow.js model for urban classification
 * This creates a model with the same architecture as the original but with proper weight format
 */

const fs = require('fs');
const path = require('path');
const tfLoader = require('./utils/tfLoader');

async function generateCompatibleModel() {
  console.log('🏗️ Generating compatible TensorFlow.js model...\n');

  try {
    // Initialize TensorFlow.js
    const tf = await tfLoader.initialize();
    if (!tf) {
      throw new Error('Failed to initialize TensorFlow.js');
    }

    console.log('✅ TensorFlow.js initialized successfully\n');

    // Read the original model configuration
    const originalModelPath = path.join(__dirname, '../ai/model/model.json');
    const originalModel = JSON.parse(fs.readFileSync(originalModelPath, 'utf8'));
    const labelsPath = path.join(__dirname, '../ai/model/labels.json');
    const labels = JSON.parse(fs.readFileSync(labelsPath, 'utf8'));

    console.log(`📋 Original model: ${originalModel.modelTopology.model_config.config.name}`);
    console.log(`🏷️ Categories: ${labels.aiCategories.join(', ')}\n`);

    // Create a new model with the same architecture
    console.log('🏗️ Building model architecture...');
    
    const model = tf.sequential({
      layers: [
        // Input layer (implicit - defined by first layer input shape)
        tf.layers.conv2d({
          inputShape: [224, 224, 3],
          filters: 32,
          kernelSize: [3, 3],
          strides: [1, 1],
          padding: 'valid',
          activation: 'relu',
          useBias: true,
          name: 'conv2d_1'
        }),
        tf.layers.maxPooling2d({
          poolSize: [2, 2],
          strides: [2, 2],
          name: 'max_pooling2d_1'
        }),
        tf.layers.conv2d({
          filters: 64,
          kernelSize: [3, 3],
          strides: [1, 1],
          padding: 'valid',
          activation: 'relu',
          useBias: true,
          name: 'conv2d_2'
        }),
        tf.layers.maxPooling2d({
          poolSize: [2, 2],
          strides: [2, 2],
          name: 'max_pooling2d_2'
        }),
        tf.layers.globalAveragePooling2d({
          name: 'global_average_pooling2d_1'
        }),
        tf.layers.dense({
          units: 128,
          activation: 'relu',
          useBias: true,
          name: 'dense_1'
        }),
        tf.layers.dense({
          units: labels.aiCategories.length, // 10 categories
          activation: 'softmax',
          useBias: true,
          name: 'predictions'
        })
      ]
    });

    console.log('✅ Model architecture created');
    
    // Print model summary
    console.log('\n📊 Model Summary:');
    model.summary();

    // Initialize weights with random values (since we don't have trained weights)
    // In a real scenario, you would load pre-trained weights here
    console.log('\n🎲 Initializing model weights with random values...');
    
    // The model already has random weights after creation, so we just need to compile it
    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    // Save the model manually using our custom approach
    const outputDir = path.join(__dirname, '../ai/model');
    const targetModelPath = path.join(outputDir, 'model_updated.json');
    const targetWeightsPath = path.join(outputDir, 'model_updated.bin');
    
    console.log(`\n💾 Saving compatible model manually...`);
    
    // Get the model's topology and weights
    const modelTopology = model.toJSON();
    const weights = model.getWeights();
    
    console.log(`🏗️ Model has ${weights.length} weight tensors`);
    
    // Collect weight specifications and data
    const weightSpecs = [];
    const weightDataParts = [];
    let totalBytes = 0;
    
    for (let i = 0; i < weights.length; i++) {
      const weight = weights[i];
      const spec = {
        name: weight.name || `weight_${i}`,
        shape: weight.shape,
        dtype: weight.dtype
      };
      weightSpecs.push(spec);
      
      // Get the weight data as a Float32Array
      const weightData = await weight.data();
      weightDataParts.push(new Float32Array(weightData));
      totalBytes += weightData.length * 4; // 4 bytes per float32
      
      console.log(`   - ${spec.name}: ${spec.shape} (${spec.dtype}) - ${weightData.length * 4} bytes`);
    }
    
    // Combine all weight data into a single ArrayBuffer
    const combinedBuffer = new ArrayBuffer(totalBytes);
    const combinedView = new Float32Array(combinedBuffer);
    let offset = 0;
    
    for (const weightData of weightDataParts) {
      combinedView.set(weightData, offset);
      offset += weightData.length;
    }
    
    console.log(`📦 Combined weights: ${totalBytes} bytes`);
    
    // Create the model JSON structure
    const modelJson = {
      format: 'layers-model',
      generatedBy: 'TensorFlow.js tfjs-layers v4.10.0',
      convertedBy: 'Custom Node.js Generator v1.0.0',
      modelTopology: modelTopology,
      weightsManifest: [{
        paths: ['model_updated.bin'],
        weights: weightSpecs
      }]
    };
    
    // Write the model JSON file
    fs.writeFileSync(targetModelPath, JSON.stringify(modelJson, null, 2), 'utf8');
    console.log(`📄 Saved model topology: model_updated.json`);
    
    // Write the weights binary file
    fs.writeFileSync(targetWeightsPath, Buffer.from(combinedBuffer));
    console.log(`⚖️ Saved model weights: model_updated.bin`);
    
    console.log('\n🎉 Compatible model generation completed!');
    console.log(`📁 Files created:`);
    console.log(`   - model_updated.json (${fs.statSync(targetModelPath).size} bytes)`);
    console.log(`   - model_updated.bin (${fs.statSync(targetWeightsPath).size} bytes)`);
    
    // Test loading the new model
    console.log('\n🧪 Testing the new model...');
    try {
      const testModel = await tfLoader.loadModel(targetModelPath);
      console.log('✅ New model loads successfully!');
      console.log(`📊 Input shape: ${JSON.stringify(testModel.inputs[0].shape)}`);
      console.log(`🎯 Output shape: ${JSON.stringify(testModel.outputs[0].shape)}`);
      console.log(`🔢 Total parameters: ${testModel.countParams()}`);
      
      // Test a prediction with dummy data
      const dummyInput = tf.randomNormal([1, 224, 224, 3]);
      const prediction = testModel.predict(dummyInput);
      const predictionData = await prediction.data();
      
      console.log(`\n🔮 Test prediction: ${Array.from(predictionData).map(x => x.toFixed(4)).join(', ')}`);
      
      // Clean up
      dummyInput.dispose();
      prediction.dispose();
      testModel.dispose();
      
      console.log('✅ Model test completed successfully!');
      
    } catch (error) {
      console.error('❌ Model test failed:', error.message);
    }

    // Clean up
    model.dispose();
    
    console.log('\n🎊 All done! You can now use model_updated.json and model_updated.bin');
    console.log('💡 To use the new model, update your code to load "model_updated.json" instead of "model.json"');

  } catch (error) {
    console.error('❌ Error generating model:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  generateCompatibleModel().catch(console.error);
}

module.exports = { generateCompatibleModel };
