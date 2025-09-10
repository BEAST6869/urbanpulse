/**
 * TensorFlow.js Loader for Browser
 * Handles loading TensorFlow.js with downloaded files for local inference
 */

interface TFLoaderConfig {
  modelPath: string;
  useLocalFiles: boolean;
  fallbackToAPI: boolean;
}

interface ClassificationResult {
  category: string;
  confidence: number;
  allPredictions: Array<{
    category: string;
    confidence: number;
  }>;
  processingTime: number;
  source: 'local' | 'api';
}

class TensorFlowLoader {
  private tf: any = null;
  private model: any = null;
  private isLoaded = false;
  private isInitializing = false;
  private labels: string[] = [];
  private readonly config: TFLoaderConfig;

  constructor(config: Partial<TFLoaderConfig> = {}) {
    this.config = {
      modelPath: '/models',
      useLocalFiles: true,
      fallbackToAPI: true,
      ...config
    };
  }

  /**
   * Initialize TensorFlow.js with local files
   */
  async initialize(): Promise<boolean> {
    if (this.isLoaded) {
      return true;
    }

    if (this.isInitializing) {
      // Wait for ongoing initialization
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.isLoaded;
    }

    this.isInitializing = true;

    try {
      console.log('🔧 Loading TensorFlow.js from local files...');

      // Load TensorFlow.js from local files
      await this.loadTensorFlowScript();

      if (!window.tf) {
        throw new Error('TensorFlow.js not available after loading');
      }

      this.tf = window.tf;
      
      // Initialize backend
      await this.tf.ready();
      console.log(`✅ TensorFlow.js loaded successfully`);
      console.log(`🖥️ Backend: ${this.tf.getBackend()}`);
      console.log(`📊 Version: ${this.tf.version?.tfjs || 'Unknown'}`);

      // Load model and labels
      await this.loadModel();
      
      this.isLoaded = true;
      console.log('🎉 TensorFlow.js initialization complete');
      
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize TensorFlow.js:', error);
      return false;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Load TensorFlow.js scripts from local files
   */
  private async loadTensorFlowScript(): Promise<void> {
    // Check if already loaded
    if (window.tf) {
      return;
    }

    try {
      // Try loading from local files first
      await this.loadScript('/libs/tf.min.js');
      await this.loadScript('/libs/tf-backend-cpu.min.js');
      
      console.log('✅ Loaded TensorFlow.js from local files');
    } catch (error) {
      console.warn('⚠️ Failed to load local files, falling back to CDN:', error);
      
      // Fallback to CDN if local files fail
      await this.loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.4.0/dist/tf.min.js');
      await this.loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-cpu@4.4.0/dist/tf-backend-cpu.min.js');
      
      console.log('✅ Loaded TensorFlow.js from CDN');
    }
  }

  /**
   * Dynamically load a script
   */
  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      
      script.onload = () => {
        console.log(`✅ Loaded: ${src}`);
        resolve();
      };
      
      script.onerror = () => {
        console.error(`❌ Failed to load: ${src}`);
        reject(new Error(`Failed to load script: ${src}`));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Load the AI model and labels
   */
  private async loadModel(): Promise<void> {
    try {
      console.log('🧠 Loading AI model...');

      // Load labels first
      const labelsResponse = await fetch(`${this.config.modelPath}/labels.json`);
      if (!labelsResponse.ok) {
        throw new Error(`Failed to load labels: ${labelsResponse.status}`);
      }
      
      const labelsData = await labelsResponse.json();
      this.labels = labelsData.aiCategories || [];
      console.log(`📋 Loaded ${this.labels.length} categories`);

      // Load the model
      const modelUrl = `${this.config.modelPath}/model.json`;
      this.model = await this.tf.loadLayersModel(modelUrl);
      
      console.log('✅ Model loaded successfully');
      console.log(`📈 Input shape: ${JSON.stringify(this.model.inputs[0].shape)}`);
      console.log(`🎯 Output shape: ${JSON.stringify(this.model.outputs[0].shape)}`);

    } catch (error) {
      console.error('❌ Failed to load model:', error);
      
      if (this.config.fallbackToAPI) {
        console.log('🔄 Will fallback to API classification');
      } else {
        throw error;
      }
    }
  }

  /**
   * Classify an image using the local model
   */
  async classifyImage(imageFile: File): Promise<ClassificationResult> {
    const startTime = Date.now();

    // Try local classification first
    if (this.isLoaded && this.model) {
      try {
        return await this.classifyImageLocally(imageFile, startTime);
      } catch (error) {
        console.error('❌ Local classification failed:', error);
        
        if (!this.config.fallbackToAPI) {
          throw error;
        }
      }
    }

    // Fallback to API classification
    if (this.config.fallbackToAPI) {
      console.log('🔄 Falling back to API classification...');
      return await this.classifyImageViaAPI(imageFile, startTime);
    }

    throw new Error('Classification not available');
  }

  /**
   * Classify image using local TensorFlow.js model
   */
  private async classifyImageLocally(imageFile: File, startTime: number): Promise<ClassificationResult> {
    console.log('🧠 Running local TensorFlow.js classification...');

    // Create image tensor
    const imageTensor = await this.createImageTensor(imageFile);
    let predictions: any = null;

    try {
      // Run inference
      predictions = this.model.predict(imageTensor) as any;
      const predictionData = await predictions.data();
      const predictionArray = Array.from(predictionData);

      // Format predictions
      const allPredictions = this.labels.map((category, index) => ({
        category,
        confidence: predictionArray[index] || 0
      })).sort((a, b) => b.confidence - a.confidence);

      const topPrediction = allPredictions[0];
      const processingTime = Date.now() - startTime;

      console.log(`✅ Local classification completed in ${processingTime}ms`);

      return {
        category: topPrediction.category,
        confidence: topPrediction.confidence,
        allPredictions,
        processingTime,
        source: 'local'
      };

    } finally {
      // Clean up tensors
      imageTensor.dispose();
      if (predictions) {
        predictions.dispose();
      }
    }
  }

  /**
   * Classify image via API fallback
   */
  private async classifyImageViaAPI(imageFile: File, startTime: number): Promise<ClassificationResult> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch('/api/classify', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`API classification failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'API classification failed');
    }

    const processingTime = Date.now() - startTime;

    return {
      category: data.classification.category,
      confidence: data.classification.confidence,
      allPredictions: data.classification.allPredictions || [],
      processingTime,
      source: 'api'
    };
  }

  /**
   * Create tensor from image file
   */
  private async createImageTensor(imageFile: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          // Create canvas and resize image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            throw new Error('Unable to get canvas context');
          }

          canvas.width = 224;
          canvas.height = 224;
          
          // Draw and resize image
          ctx.drawImage(img, 0, 0, 224, 224);
          
          // Get image data and convert to tensor
          const imageData = ctx.getImageData(0, 0, 224, 224);
          const pixels = imageData.data;
          
          // Convert RGBA to RGB and normalize
          const rgbPixels = new Float32Array(224 * 224 * 3);
          for (let i = 0; i < pixels.length; i += 4) {
            const rgbIndex = (i / 4) * 3;
            rgbPixels[rgbIndex] = pixels[i] / 255;         // R
            rgbPixels[rgbIndex + 1] = pixels[i + 1] / 255; // G
            rgbPixels[rgbIndex + 2] = pixels[i + 2] / 255; // B
          }
          
          // Create tensor with batch dimension
          const tensor = this.tf.tensor4d(rgbPixels, [1, 224, 224, 3]);
          resolve(tensor);
          
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = URL.createObjectURL(imageFile);
    });
  }

  /**
   * Get system information
   */
  getSystemInfo() {
    if (!this.isLoaded || !this.tf) {
      return {
        status: 'not_loaded',
        available: false
      };
    }

    return {
      status: 'loaded',
      available: true,
      version: this.tf.version,
      backend: this.tf.getBackend(),
      memory: this.tf.memory?.() || null,
      modelLoaded: !!this.model,
      categories: this.labels.length,
      platform: 'browser'
    };
  }

  /**
   * Check if local classification is available
   */
  isLocalClassificationAvailable(): boolean {
    return this.isLoaded && !!this.model;
  }
}

// Create singleton instance
const tfLoader = new TensorFlowLoader();

// Export for use in React components
export { tfLoader, type ClassificationResult };
export default tfLoader;
