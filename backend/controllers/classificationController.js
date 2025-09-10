const aiService = require('../services/aiClassificationService');

// Load the AI service
const loadModel = async () => {
  try {
    const success = await aiService.initialize();
    return success;
  } catch (error) {
    console.error('❌ Error loading AI service:', error.message);
    return false;
  }
};

// Classify image using the AI service
const classifyImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
        error: 'Missing image file'
      });
    }
    
    console.log(`🖼️ Processing image: ${req.file.originalname || 'uploaded'} (${req.file.size} bytes)`);
    
    // Classify using AI service
    const result = await aiService.classifyImage(req.file.buffer);
    
    res.json({
      success: true,
      classification: {
        category: result.category,
        backendCategory: result.backendCategory,
        confidence: result.confidence,
        allPredictions: result.allPredictions,
        threshold: result.threshold
      },
      modelInfo: {
        categories: result.allPredictions.length,
        version: 'v1.0.0-intelligent',
        type: 'feature_based_classifier'
      },
      features: result.features
    });
    
  } catch (error) {
    console.error('Classification error:', error);
    
    // Check if AI service is not initialized
    if (error.message.includes('not initialized')) {
      return res.status(503).json({
        success: false,
        message: 'AI model not available. Please check model files.',
        error: 'Service not initialized'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Image classification failed',
      error: error.message
    });
  }
};

// Get model information and health status
const getModelInfo = async (req, res) => {
  try {
    const modelInfo = aiService.getStatus();
    
    res.json({
      success: true,
      data: modelInfo
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get model information',
      error: error.message
    });
  }
};

// Initialize model loading on module load
loadModel().catch(console.error);

module.exports = {
  classifyImage,
  getModelInfo,
  loadModel
};
