// AI Image Classification using backend API

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const classifyImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/api/classify`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Classification failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Classification failed');
    }

    return {
      category: data.classification.category,
      backendCategory: data.classification.backendCategory,
      confidence: data.classification.confidence,
      allPredictions: data.classification.allPredictions,
      threshold: data.classification.threshold,
      modelInfo: data.modelInfo
    };
  } catch (error) {
    console.error('Classification error:', error);
    
    // Fallback to mock classification if API fails
    const fallbackCategories = [
      'pothole',
      'garbage', 
      'streetlight',
      'road_damage',
      'vandalism',
      'construction',
      'other'
    ];
    
    const randomCategory = fallbackCategories[Math.floor(Math.random() * fallbackCategories.length)];
    const confidence = Math.random() * 0.3 + 0.4; // 40-70% confidence for fallback
    
    return {
      category: randomCategory,
      backendCategory: 'other',
      confidence: Math.round(confidence * 100) / 100,
      allPredictions: [{ category: randomCategory, confidence: confidence }],
      threshold: 0.7,
      modelInfo: { categories: fallbackCategories.length, version: 'fallback' },
      error: error.message
    };
  }
};

// Get model information and health status
export const getModelInfo = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/classify/model-info`);
    
    if (!response.ok) {
      throw new Error(`Failed to get model info: ${response.status}`);
    }
    
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Model info error:', error);
    return null;
  }
};

// Check if AI classification is available
export const isClassificationAvailable = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();
    return data.aiModel?.available || false;
  } catch (error) {
    return false;
  }
};

export default function Classifier() {
  // This is a utility component - no UI rendering needed
  return null;
}
