const fs = require('fs').promises;
const path = require('path');

let labelsConfig = null;

// Load the labels configuration
const loadLabelsConfig = async () => {
  try {
    const labelsPath = path.join(__dirname, '../../ai/model/labels.json');
    const labelsData = await fs.readFile(labelsPath, 'utf8');
    labelsConfig = JSON.parse(labelsData);
    console.log('✅ AI labels configuration loaded');
    console.log(`📋 Categories: ${labelsConfig.aiCategories.join(', ')}`);
    return true;
  } catch (error) {
    console.log('⚠️ Labels configuration not found:', error.message);
    return false;
  }
};

// Initialize labels loading
loadLabelsConfig().catch(console.error);

// Mock classify image using weighted random selection
const classifyImage = async (req, res) => {
  try {
    if (!labelsConfig) {
      return res.status(503).json({
        success: false,
        message: 'AI model configuration not available.',
        error: 'Labels not loaded'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
        error: 'Missing image file'
      });
    }
    
    // Mock classification with realistic probability distribution
    const categories = labelsConfig.aiCategories;
    
    // Create weighted probabilities (some categories more likely than others)
    const weights = {
      'pothole': 0.20,
      'garbage': 0.18,
      'road_damage': 0.15,
      'streetlight': 0.12,
      'sidewalk_damage': 0.10,
      'vandalism': 0.08,
      'construction': 0.07,
      'water_leak': 0.05,
      'traffic_sign': 0.03,
      'other': 0.02
    };
    
    // Generate random predictions for all categories
    const allPredictions = categories.map(category => {
      const baseWeight = weights[category] || 0.1;
      const randomVariation = (Math.random() - 0.5) * 0.4; // ±20% variation
      const confidence = Math.max(0.05, Math.min(0.95, baseWeight + randomVariation));
      
      return {
        category: category,
        confidence: parseFloat(confidence.toFixed(4)),
        backendCategory: labelsConfig.categoryMapping[category]
      };
    });
    
    // Sort by confidence (highest first)
    allPredictions.sort((a, b) => b.confidence - a.confidence);
    
    // Get top prediction
    const topPrediction = allPredictions[0];
    
    // Determine final category based on confidence threshold
    let finalCategory = topPrediction.category;
    let finalBackendCategory = topPrediction.backendCategory;
    
    if (topPrediction.confidence < labelsConfig.confidenceThreshold) {
      finalCategory = labelsConfig.defaultCategory;
      finalBackendCategory = labelsConfig.categoryMapping[finalCategory];
    }
    
    res.json({
      success: true,
      classification: {
        category: finalCategory,
        backendCategory: finalBackendCategory,
        confidence: topPrediction.confidence,
        allPredictions: allPredictions,
        threshold: labelsConfig.confidenceThreshold
      },
      modelInfo: {
        categories: labelsConfig.aiCategories.length,
        version: 'v1.0.0-mock',
        type: 'mock_classifier'
      }
    });
    
  } catch (error) {
    console.error('Mock classification error:', error);
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
    const isConfigLoaded = labelsConfig !== null;
    
    const modelInfo = {
      status: isConfigLoaded ? 'loaded' : 'not_loaded',
      categories: isConfigLoaded ? labelsConfig.aiCategories : [],
      backendCategories: isConfigLoaded ? labelsConfig.backendCategories : [],
      categoryMapping: isConfigLoaded ? labelsConfig.categoryMapping : {},
      confidenceThreshold: isConfigLoaded ? labelsConfig.confidenceThreshold : 0,
      totalCategories: isConfigLoaded ? labelsConfig.aiCategories.length : 0,
      lastLoaded: isConfigLoaded ? new Date().toISOString() : null,
      type: 'mock_classifier',
      note: 'This is a mock classifier for demonstration purposes'
    };
    
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

module.exports = {
  classifyImage,
  getModelInfo,
  loadLabelsConfig
};
