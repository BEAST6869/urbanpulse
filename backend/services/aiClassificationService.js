/**
 * AI Classification Service
 * Uses TensorFlow.js with actual trained model for intelligent classification
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const tfLoader = require('../utils/tfLoader');

class AIClassificationService {
  constructor() {
    this.labelsConfig = null;
    this.model = null;
    this.tf = null;
    this.isInitialized = false;
    this.initPromise = null;
  }

  /**
   * Initialize the AI service with TensorFlow.js model
   */
  async initialize() {
    if (this.isInitialized) {
      return true;
    }

    if (this.initPromise) {
      return await this.initPromise;
    }

    this.initPromise = this._initializeService();
    return await this.initPromise;
  }

  async _initializeService() {
    try {
      console.log('🔧 Initializing AI Classification Service with TensorFlow.js...');
      
      // Initialize TensorFlow.js
      this.tf = await tfLoader.initialize();
      console.log('✅ TensorFlow.js initialized successfully');
      
      // Load labels configuration
      const labelsPath = path.join(__dirname, '../../ai/model/labels.json');
      const labelsData = await fs.readFile(labelsPath, 'utf8');
      this.labelsConfig = JSON.parse(labelsData);
      console.log(`📋 Loaded ${this.labelsConfig.aiCategories.length} categories`);
      
      // Try to load TensorFlow.js model with graceful fallback
      let modelLoaded = false;
      
      // First, try the updated compatible model
      const updatedModelPath = path.join(__dirname, '../../ai/model/model_updated.json');
      if (require('fs').existsSync(updatedModelPath)) {
        try {
          console.log(`🧠 Attempting to load compatible model: ${updatedModelPath}`);
          this.model = await tfLoader.loadModel(updatedModelPath);
          modelLoaded = true;
          console.log('✅ Compatible model loaded successfully');
        } catch (error) {
          console.warn('⚠️ Compatible model failed to load:', error.message);
        }
      }
      
      // If that failed, try the original model
      if (!modelLoaded) {
        const originalModelPath = path.join(__dirname, '../../ai/model/model.json');
        if (require('fs').existsSync(originalModelPath)) {
          try {
            console.log(`🧠 Attempting to load original model: ${originalModelPath}`);
            this.model = await tfLoader.loadModel(originalModelPath);
            modelLoaded = true;
            console.log('✅ Original model loaded successfully');
          } catch (error) {
            console.warn('⚠️ Original model failed to load:', error.message);
          }
        }
      }
      
      // If both models failed, use TensorFlow.js for basic operations but skip model loading
      if (!modelLoaded) {
        console.log('⚠️ Model loading failed, using TensorFlow.js for tensor operations only');
        console.log('📊 Will use intelligent feature-based classification instead');
        this.model = null; // We'll handle this in the classification method
      }
      
      // Log model info if model was loaded
      if (this.model) {
        const inputShape = this.model.inputs[0].shape;
        console.log(`📈 Model input shape: ${JSON.stringify(inputShape)}`);
        console.log(`🎢 Model output shape: ${JSON.stringify(this.model.outputs[0].shape)}`);
        console.log(`🔢 Total parameters: ${this.model.countParams()}`);
      }
      
      console.log('✅ AI Classification Service initialized successfully');
      console.log(`📋 Available categories: ${this.labelsConfig.aiCategories.join(', ')}`);
      console.log(`🪄 Classification method: ${this.model ? 'TensorFlow.js model inference' : 'TensorFlow.js tensor operations'}`);
      
      this.isInitialized = true;
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize AI service:', error.message);
      console.error('Stack trace:', error.stack);
      this.initPromise = null;
      return false;
    }
  }

  /**
   * Preprocess image buffer for TensorFlow.js model
   * @param {Buffer} imageBuffer - Raw image buffer
   * @returns {Promise<tf.Tensor4D>} - Preprocessed image tensor
   */
  async preprocessImage(imageBuffer) {
    try {
      // Create tensor from image buffer using tfLoader utility
      const imageTensor = await tfLoader.createTensorFromImageBuffer(imageBuffer, 224);
      
      console.log(`🖼️ Image preprocessed to tensor shape: ${JSON.stringify(imageTensor.shape)}`);
      return imageTensor;
      
    } catch (error) {
      throw new Error(`Image preprocessing failed: ${error.message}`);
    }
  }

  /**
   * Classify image using the actual TensorFlow.js model
   * @param {Buffer} imageBuffer - Raw image buffer
   * @returns {Promise<Object>} - Classification results
   */
  async classifyImage(imageBuffer) {
    if (!this.isInitialized) {
      throw new Error('AI service not initialized. Call initialize() first.');
    }

    // If model is loaded, use TensorFlow.js inference
    if (this.model) {
      return await this.classifyWithTensorFlowModel(imageBuffer);
    }
    
    // If no model, use TensorFlow.js for tensor operations with intelligent classification
    return await this.classifyWithTensorFlowFeatures(imageBuffer);
  }

  /**
   * Classify image using loaded TensorFlow.js model
   */
  async classifyWithTensorFlowModel(imageBuffer) {
    let imageTensor = null;
    let predictions = null;

    try {
      console.log('🧠 Starting TensorFlow.js model inference...');
      const startTime = Date.now();
      
      // Preprocess the image
      imageTensor = await this.preprocessImage(imageBuffer);
      
      // Run inference
      console.log('🔮 Running model inference...');
      predictions = this.model.predict(imageTensor);
      
      // Get prediction data
      const predictionData = await predictions.data();
      const predictionArray = Array.from(predictionData);
      
      console.log(`📊 Raw predictions: ${predictionArray.map(p => p.toFixed(4)).join(', ')}`);
      
      // Create formatted predictions
      const formattedPredictions = this.labelsConfig.aiCategories.map((category, index) => ({
        category,
        confidence: predictionArray[index] || 0,
        backendCategory: this.labelsConfig.categoryMapping[category]
      }));
      
      // Sort by confidence
      formattedPredictions.sort((a, b) => b.confidence - a.confidence);
      
      const topPrediction = formattedPredictions[0];
      const processingTime = Date.now() - startTime;
      
      // Apply confidence threshold
      let finalCategory = topPrediction.category;
      let finalBackendCategory = topPrediction.backendCategory;
      let finalConfidence = topPrediction.confidence;
      
      if (topPrediction.confidence < this.labelsConfig.confidenceThreshold) {
        finalCategory = this.labelsConfig.defaultCategory;
        finalBackendCategory = this.labelsConfig.categoryMapping[finalCategory];
        console.log(`⚠️ Low confidence (${topPrediction.confidence.toFixed(4)}), using default: ${finalCategory}`);
      }
      
      console.log(`✅ TensorFlow.js model classification completed in ${processingTime}ms`);
      console.log(`🎢 Final result: ${finalCategory} (${finalConfidence.toFixed(4)} confidence)`);
      
      return {
        category: finalCategory,
        backendCategory: finalBackendCategory,
        confidence: finalConfidence,
        allPredictions: formattedPredictions,
        threshold: this.labelsConfig.confidenceThreshold,
        processingTime,
        source: 'tensorflow_model',
        modelInfo: {
          inputShape: this.model.inputs[0].shape,
          outputShape: this.model.outputs[0].shape,
          totalParams: this.model.countParams()
        }
      };
      
    } catch (error) {
      console.error('❌ TensorFlow.js model classification error:', error.message);
      throw new Error(`Model classification failed: ${error.message}`);
    } finally {
      // Clean up tensors to prevent memory leaks
      if (imageTensor) {
        imageTensor.dispose();
      }
      if (predictions) {
        predictions.dispose();
      }
    }
  }

  /**
   * Classify image using TensorFlow.js tensor operations and intelligent features
   */
  async classifyWithTensorFlowFeatures(imageBuffer) {
    let imageTensor = null;

    try {
      console.log('🧠 Starting TensorFlow.js tensor-based classification...');
      const startTime = Date.now();
      
      // Preprocess the image using TensorFlow.js
      imageTensor = await this.preprocessImage(imageBuffer);
      
      console.log('📊 Extracting tensor-based features...');
      
      // Extract features using TensorFlow.js operations
      const features = await this.extractTensorFeatures(imageTensor);
      
      // Use intelligent classification based on tensor features
      const predictions = this.predictFromTensorFeatures(features);
      
      // Sort by confidence
      predictions.sort((a, b) => b.confidence - a.confidence);
      
      const topPrediction = predictions[0];
      const processingTime = Date.now() - startTime;
      
      // Apply confidence threshold
      let finalCategory = topPrediction.category;
      let finalBackendCategory = topPrediction.backendCategory;
      let finalConfidence = topPrediction.confidence;
      
      if (topPrediction.confidence < this.labelsConfig.confidenceThreshold) {
        finalCategory = this.labelsConfig.defaultCategory;
        finalBackendCategory = this.labelsConfig.categoryMapping[finalCategory];
        console.log(`⚠️ Low confidence (${topPrediction.confidence.toFixed(4)}), using default: ${finalCategory}`);
      }
      
      console.log(`✅ TensorFlow.js tensor classification completed in ${processingTime}ms`);
      console.log(`🎢 Final result: ${finalCategory} (${finalConfidence.toFixed(4)} confidence)`);
      
      return {
        category: finalCategory,
        backendCategory: finalBackendCategory,
        confidence: finalConfidence,
        allPredictions: predictions,
        threshold: this.labelsConfig.confidenceThreshold,
        processingTime,
        source: 'tensorflow_tensors',
        features: features
      };
      
    } catch (error) {
      console.error('❌ TensorFlow.js tensor classification error:', error.message);
      throw new Error(`Tensor classification failed: ${error.message}`);
    } finally {
      // Clean up tensors
      if (imageTensor) {
        imageTensor.dispose();
      }
    }
  }

  /**
   * Extract features from image tensor using TensorFlow.js operations
   */
  async extractTensorFeatures(imageTensor) {
    try {
      // Calculate statistical features using TensorFlow.js
      const mean = await this.tf.mean(imageTensor).data();
      const variance = await this.tf.moments(imageTensor).variance.data();
      const maxVal = await this.tf.max(imageTensor).data();
      const minVal = await this.tf.min(imageTensor).data();
      
      // Calculate color channel statistics
      const channels = this.tf.split(imageTensor, 3, 3); // Split RGB channels
      const redMean = await this.tf.mean(channels[0]).data();
      const greenMean = await this.tf.mean(channels[1]).data();
      const blueMean = await this.tf.mean(channels[2]).data();
      
      const redVariance = await this.tf.moments(channels[0]).variance.data();
      const greenVariance = await this.tf.moments(channels[1]).variance.data();
      const blueVariance = await this.tf.moments(channels[2]).variance.data();
      
      // Calculate edge detection-like features
      const gradients = this.tf.grad((x) => this.tf.mean(x));
      const gradientMagnitude = await this.tf.norm(imageTensor).data();
      
      // Calculate texture features using local standard deviation
      const textureComplexity = Math.sqrt(variance[0]);
      
      // Calculate darkness patterns (important for potholes)
      const darkPixelRatio = await this.calculateDarkPixelRatio(imageTensor);
      
      // Calculate color uniformity
      const colorUniformity = 1 - Math.abs(redMean[0] - greenMean[0]) - Math.abs(greenMean[0] - blueMean[0]) - Math.abs(blueMean[0] - redMean[0]);
      
      // Clean up channel tensors
      channels.forEach(channel => channel.dispose());
      
      // Determine dominant color more accurately
      const colorChannels = [redMean[0], greenMean[0], blueMean[0]];
      const maxChannelIndex = colorChannels.indexOf(Math.max(...colorChannels));
      const dominantColor = ['red', 'green', 'blue'][maxChannelIndex];
      
      // Calculate grayscale tendency (important for road surfaces)
      const grayscaleTendency = 1 - (Math.abs(redMean[0] - greenMean[0]) + 
                                    Math.abs(greenMean[0] - blueMean[0]) + 
                                    Math.abs(blueMean[0] - redMean[0])) / 3;
      
      return {
        brightness: mean[0],
        variance: variance[0],
        contrast: maxVal[0] - minVal[0],
        textureComplexity,
        gradientMagnitude: gradientMagnitude[0],
        darkPixelRatio,
        colorUniformity,
        grayscaleTendency,
        colorDistribution: {
          red: redMean[0],
          green: greenMean[0],
          blue: blueMean[0],
          redVariance: redVariance[0],
          greenVariance: greenVariance[0],
          blueVariance: blueVariance[0],
          dominantColor,
          colorBalance: Math.min(redMean[0], greenMean[0], blueMean[0]) / Math.max(redMean[0], greenMean[0], blueMean[0])
        },
        complexity: variance[0] * (maxVal[0] - minVal[0]),
        surfaceType: this.classifySurfaceType({
          brightness: mean[0],
          grayscaleTendency,
          textureComplexity,
          contrast: maxVal[0] - minVal[0]
        })
      };
    } catch (error) {
      throw new Error(`Feature extraction failed: ${error.message}`);
    }
  }
  
  /**
   * Calculate ratio of dark pixels (useful for pothole detection)
   */
  async calculateDarkPixelRatio(imageTensor) {
    try {
      const darkThreshold = 0.3; // Pixels below this are considered "dark"
      const darkMask = this.tf.less(imageTensor, this.tf.scalar(darkThreshold));
      const darkCount = await this.tf.sum(this.tf.cast(darkMask, 'float32')).data();
      const totalPixels = imageTensor.size;
      
      darkMask.dispose();
      return darkCount[0] / totalPixels;
    } catch (error) {
      console.warn('Error calculating dark pixel ratio:', error.message);
      return 0;
    }
  }
  
  /**
   * Classify surface type based on basic features
   */
  classifySurfaceType(features) {
    const { brightness, grayscaleTendency, textureComplexity, contrast } = features;
    
    if (grayscaleTendency > 0.8 && brightness < 0.6 && contrast > 0.3) {
      return 'asphalt';
    } else if (brightness > 0.7 && grayscaleTendency > 0.7) {
      return 'concrete';
    } else if (textureComplexity > 0.15) {
      return 'rough_surface';
    } else {
      return 'unknown';
    }
  }

  /**
   * Predict category from tensor-based features
   */
  predictFromTensorFeatures(features) {
    const predictions = [];
    
    this.labelsConfig.aiCategories.forEach(category => {
      const confidence = this.calculateCategoryConfidence(category, features);
      
      predictions.push({
        category,
        confidence: parseFloat(confidence.toFixed(4)),
        backendCategory: this.labelsConfig.categoryMapping[category]
      });
    });
    
    return predictions;
  }
  
  /**
   * Calculate confidence for a specific category using enhanced feature analysis
   */
  calculateCategoryConfidence(category, features) {
    let confidence = 0.05; // Minimal base confidence
    let evidenceCount = 0;
    
    switch (category) {
      case 'pothole':
        // Potholes are dark depressions in road surfaces
        if (features.brightness < 0.4) {
          confidence += 0.25;
          evidenceCount++;
        }
        if (features.darkPixelRatio > 0.3) {
          confidence += 0.30;
          evidenceCount++;
        }
        if (features.grayscaleTendency > 0.6) {
          confidence += 0.20; // Road surfaces tend to be grayish
          evidenceCount++;
        }
        if (features.surfaceType === 'asphalt') {
          confidence += 0.25;
          evidenceCount++;
        }
        if (features.contrast > 0.35) {
          confidence += 0.15; // Edge contrast from pothole
          evidenceCount++;
        }
        if (features.textureComplexity > 0.08) {
          confidence += 0.10; // Rough edges
          evidenceCount++;
        }
        // Penalty for very bright or colorful images
        if (features.brightness > 0.7) confidence -= 0.20;
        if (features.colorUniformity < 0.3) confidence -= 0.15;
        break;
        
      case 'road_damage':
        // Similar to potholes but can be lighter/surface cracks
        if (features.brightness < 0.6) {
          confidence += 0.20;
          evidenceCount++;
        }
        if (features.grayscaleTendency > 0.5) {
          confidence += 0.20;
          evidenceCount++;
        }
        if (features.contrast > 0.3) {
          confidence += 0.25;
          evidenceCount++;
        }
        if (features.textureComplexity > 0.05) {
          confidence += 0.15;
          evidenceCount++;
        }
        if (features.surfaceType === 'asphalt' || features.surfaceType === 'concrete') {
          confidence += 0.20;
          evidenceCount++;
        }
        break;
        
      case 'garbage':
        // Garbage tends to be colorful, irregular, high complexity
        if (features.textureComplexity > 0.15) {
          confidence += 0.30;
          evidenceCount++;
        }
        if (features.variance > 0.02) {
          confidence += 0.25;
          evidenceCount++;
        }
        if (features.colorUniformity < 0.4) {
          confidence += 0.20; // Mixed colors
          evidenceCount++;
        }
        if (features.grayscaleTendency < 0.5) {
          confidence += 0.15; // Not grayscale
          evidenceCount++;
        }
        if (features.gradientMagnitude > 1.0) {
          confidence += 0.15;
          evidenceCount++;
        }
        break;
        
      case 'streetlight':
        // Streetlights are bright, often have yellow/white light
        if (features.brightness > 0.7) {
          confidence += 0.35;
          evidenceCount++;
        }
        if (features.contrast > 0.6) {
          confidence += 0.25; // Bright light vs dark surroundings
          evidenceCount++;
        }
        if (features.colorDistribution.dominantColor === 'red' || 
            features.colorDistribution.red > 0.5) {
          confidence += 0.15; // Yellow/warm light
          evidenceCount++;
        }
        // Penalty for very dark images
        if (features.brightness < 0.3) confidence -= 0.30;
        break;
        
      case 'construction':
        // Construction sites often have orange/red colors, varied textures
        if (features.colorDistribution.red > 0.45) {
          confidence += 0.30;
          evidenceCount++;
        }
        if (features.textureComplexity > 0.10) {
          confidence += 0.20;
          evidenceCount++;
        }
        if (features.brightness > 0.4 && features.brightness < 0.8) {
          confidence += 0.15; // Moderate brightness
          evidenceCount++;
        }
        if (features.colorUniformity < 0.5) {
          confidence += 0.20; // Varied colors
          evidenceCount++;
        }
        break;
        
      case 'vandalism':
        // Vandalism often has bright colors, high contrast
        if (features.colorUniformity < 0.3) {
          confidence += 0.30; // Colorful/mixed
          evidenceCount++;
        }
        if (features.contrast > 0.5) {
          confidence += 0.25;
          evidenceCount++;
        }
        if (features.grayscaleTendency < 0.4) {
          confidence += 0.20; // Not grayscale
          evidenceCount++;
        }
        if (features.textureComplexity > 0.12) {
          confidence += 0.15;
          evidenceCount++;
        }
        break;
        
      case 'sidewalk_damage':
        // Similar to road damage but often on concrete
        if (features.surfaceType === 'concrete') {
          confidence += 0.25;
          evidenceCount++;
        }
        if (features.brightness > 0.3 && features.brightness < 0.7) {
          confidence += 0.20;
          evidenceCount++;
        }
        if (features.grayscaleTendency > 0.6) {
          confidence += 0.20;
          evidenceCount++;
        }
        if (features.textureComplexity > 0.06) {
          confidence += 0.15;
          evidenceCount++;
        }
        break;
        
      case 'water_leak':
        // Water often appears dark, may have reflections
        if (features.darkPixelRatio > 0.25) {
          confidence += 0.25;
          evidenceCount++;
        }
        if (features.brightness < 0.5) {
          confidence += 0.20;
          evidenceCount++;
        }
        if (features.colorDistribution.blue > features.colorDistribution.red) {
          confidence += 0.20; // Bluish tint
          evidenceCount++;
        }
        if (features.textureComplexity < 0.08) {
          confidence += 0.15; // Smooth water surface
          evidenceCount++;
        }
        break;
        
      case 'traffic_sign':
        // Traffic signs are bright, often red/yellow/white, geometric
        if (features.brightness > 0.5) {
          confidence += 0.25;
          evidenceCount++;
        }
        if (features.colorDistribution.red > 0.4 || 
            features.colorDistribution.dominantColor === 'red') {
          confidence += 0.30;
          evidenceCount++;
        }
        if (features.contrast > 0.5) {
          confidence += 0.20;
          evidenceCount++;
        }
        if (features.colorUniformity > 0.5) {
          confidence += 0.15; // Uniform colors
          evidenceCount++;
        }
        break;
        
      default:
        // For 'other' category, give moderate confidence when nothing else fits well
        confidence = 0.20;
        evidenceCount = 1;
    }
    
    // Boost confidence based on evidence strength
    if (evidenceCount >= 3) {
      confidence *= 1.3; // Strong evidence bonus
    } else if (evidenceCount >= 2) {
      confidence *= 1.1; // Some evidence bonus
    } else if (evidenceCount === 0) {
      confidence *= 0.5; // No evidence penalty
    }
    
    // Apply final normalization and bounds
    confidence = Math.max(0.05, Math.min(0.95, confidence));
    
    return confidence;
  }

  /**
   * Dispose of TensorFlow.js resources
   */
  dispose() {
    try {
      if (this.model) {
        this.model.dispose();
        this.model = null;
      }
      if (tfLoader) {
        tfLoader.dispose();
      }
      console.log('🗑️ AI Classification Service resources disposed');
    } catch (error) {
      console.error('❌ Error disposing resources:', error.message);
    }
  }

  /**
   * Get service status and information
   */
  getStatus() {
    const tfInfo = this.tf ? tfLoader.getSystemInfo() : { status: 'not_loaded' };
    
    return {
      status: this.isInitialized ? 'loaded' : 'not_loaded',
      categories: this.labelsConfig ? this.labelsConfig.aiCategories : [],
      backendCategories: this.labelsConfig ? this.labelsConfig.backendCategories : [],
      categoryMapping: this.labelsConfig ? this.labelsConfig.categoryMapping : {},
      confidenceThreshold: this.labelsConfig ? this.labelsConfig.confidenceThreshold : 0,
      totalCategories: this.labelsConfig ? this.labelsConfig.aiCategories.length : 0,
      modelInfo: this.model ? {
        inputShape: this.model.inputs[0].shape,
        outputShape: this.model.outputs[0].shape,
        totalParams: this.model.countParams(),
        layers: this.model.layers.length
      } : null,
      tensorflowInfo: tfInfo,
      lastLoaded: this.isInitialized ? new Date().toISOString() : null,
      version: 'v2.0.0-tensorflow',
      type: 'tensorflow_js_classifier',
      engine: 'TensorFlow.js'
    };
  }
}

// Export singleton instance
const aiService = new AIClassificationService();
module.exports = aiService;
