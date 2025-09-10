/**
 * Local TensorFlow.js Loader
 * Loads TensorFlow.js from local downloaded files to avoid npm installation issues
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Mock Canvas implementation for Node.js
class MockCanvas {
  constructor(width = 300, height = 150) {
    this.width = width;
    this.height = height;
  }
  getContext(type) {
    if (type === '2d') {
      return new MockContext2D();
    }
    return null;
  }
  toDataURL() { return 'data:image/png;base64,'; }
}

class MockContext2D {
  drawImage() {}
  getImageData(sx, sy, sw, sh) {
    return { data: new Uint8ClampedArray(sw * sh * 4) };
  }
  putImageData() {}
}

class MockImage {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this.width = 0;
    this.height = 0;
  }
  set src(value) {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
}

class TensorFlowLoader {
  constructor() {
    this.tf = null;
    this.isLoaded = false;
    this.loadPromise = null;
  }

  async initialize() {
    if (this.isLoaded) {
      return this.tf;
    }

    if (this.loadPromise) {
      return await this.loadPromise;
    }

    this.loadPromise = this._loadTensorFlow();
    return await this.loadPromise;
  }

  async _loadTensorFlow() {
    try {
      console.log('🔧 Loading local TensorFlow.js files...');
      
      // Setup comprehensive Node.js environment for browser-based TensorFlow.js
      this._setupNodeEnvironment();
      
      // Load TensorFlow.js core
      const tfCorePath = path.join(__dirname, '../libs/tf.min.js');
      console.log(`📁 Loading TensorFlow.js core from: ${tfCorePath}`);
      
      if (!fs.existsSync(tfCorePath)) {
        throw new Error(`TensorFlow.js core file not found: ${tfCorePath}`);
      }
      
      const tfCoreCode = fs.readFileSync(tfCorePath, 'utf8');
      
      // Create isolated context for TensorFlow.js
      const context = {
        console,
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
        Buffer,
        process: {
          ...process,
          nextTick: process.nextTick.bind(process)
        },
        global,
        ...global
      };
      
      vm.createContext(context);
      vm.runInContext(tfCoreCode, context, { filename: 'tf.min.js' });
      
      // Load CPU backend
      const tfBackendPath = path.join(__dirname, '../libs/tf-backend-cpu.min.js');
      console.log(`📁 Loading CPU backend from: ${tfBackendPath}`);
      
      if (!fs.existsSync(tfBackendPath)) {
        throw new Error(`TensorFlow.js CPU backend file not found: ${tfBackendPath}`);
      }
      
      const tfBackendCode = fs.readFileSync(tfBackendPath, 'utf8');
      vm.runInContext(tfBackendCode, context, { filename: 'tf-backend-cpu.min.js' });
      
      // Get TensorFlow.js from context
      this.tf = context.tf;
      
      if (!this.tf) {
        throw new Error('TensorFlow.js not available in context after loading');
      }
      
      // Set backend and wait for initialization
      console.log('🔧 Initializing TensorFlow.js backend...');
      await this.tf.ready();
      
      console.log('✅ TensorFlow.js loaded successfully');
      console.log(`📊 Version: ${this.tf.version?.tfjs || 'Unknown'}`);
      console.log(`🖥️ Backend: ${this.tf.getBackend()}`);
      
      this.isLoaded = true;
      return this.tf;
      
    } catch (error) {
      console.error('❌ Failed to load TensorFlow.js:', error.message);
      console.error('Stack trace:', error.stack);
      this.loadPromise = null;
      throw error;
    }
  }

  _setupNodeEnvironment() {
    // Setup browser-like globals for TensorFlow.js
    if (!global.window) {
      global.window = global;
    }
    
    if (!global.document) {
      global.document = {
        createElement: (tagName) => {
          switch (tagName.toLowerCase()) {
            case 'canvas':
              return new MockCanvas();
            case 'img':
              return new MockImage();
            default:
              return {
                style: {},
                setAttribute: () => {},
                getAttribute: () => null,
                appendChild: () => {},
                removeChild: () => {},
                addEventListener: () => {},
                removeEventListener: () => {},
                getContext: () => new MockContext2D()
              };
          }
        },
        createElementNS: () => ({
          style: {},
          setAttribute: () => {},
          getAttribute: () => null
        }),
        addEventListener: () => {},
        removeEventListener: () => {},
        body: { appendChild: () => {}, removeChild: () => {} },
        readyState: 'complete'
      };
    }
    
    if (!global.navigator) {
      global.navigator = {
        userAgent: 'Node.js TensorFlow.js',
        platform: process.platform,
        hardwareConcurrency: require('os').cpus().length
      };
    }
    
    // Mock DOM classes
    global.HTMLCanvasElement = MockCanvas;
    global.HTMLImageElement = MockImage;
    global.HTMLVideoElement = class MockVideo {};
    global.ImageData = class MockImageData {
      constructor(width, height) {
        this.width = width;
        this.height = height;
        this.data = new Uint8ClampedArray(width * height * 4);
      }
    };
    global.Image = MockImage;
    
    // Mock requestAnimationFrame
    if (!global.requestAnimationFrame) {
      global.requestAnimationFrame = (callback) => setTimeout(callback, 16);
      global.cancelAnimationFrame = clearTimeout;
    }
    
    // Mock performance API
    if (!global.performance) {
      global.performance = {
        now: () => Date.now(),
        mark: () => {},
        measure: () => {},
        getEntriesByName: () => []
      };
    }
  }

  getTensorFlow() {
    if (!this.isLoaded) {
      throw new Error('TensorFlow.js not initialized. Call initialize() first.');
    }
    return this.tf;
  }

  /**
   * Load a TensorFlow.js model from local files
   * @param {string} modelPath - Path to the model.json file
   * @returns {Promise<tf.LayersModel>} - Loaded model
   */
  async loadModel(modelPath) {
    if (!this.isLoaded) {
      await this.initialize();
    }
    
    console.log(`🧠 Loading model from: ${modelPath}`);
    
    try {
      // Create a custom HTTP-like handler for local files
      const modelDir = path.dirname(path.resolve(modelPath));
      const modelFilename = path.basename(modelPath);
      
      console.log(`🖼️ Model directory: ${modelDir}`);
      console.log(`📝 Model file: ${modelFilename}`);
      
      // Create a custom fetch function for local file access
      const customFetch = async (url) => {
        let filePath;
        
        if (url.startsWith('file://')) {
          const cleanUrl = url.replace(/^file:\/\//, '');
          if (path.isAbsolute(cleanUrl)) {
            filePath = cleanUrl;
          } else {
            // Relative URL with file:// prefix - resolve relative to model directory
            filePath = path.resolve(modelDir, cleanUrl);
          }
        } else {
          // Handle relative URLs by resolving them relative to the model directory
          filePath = path.resolve(modelDir, url);
        }
        
        console.log(`📁 Fetching: ${url} -> ${filePath}`);
        
        if (url.endsWith('.json')) {
          const content = fs.readFileSync(filePath, 'utf8');
          return {
            ok: true,
            json: async () => JSON.parse(content),
            text: async () => content
          };
        } else if (url.endsWith('.bin')) {
          const buffer = fs.readFileSync(filePath);
          return {
            ok: true,
            arrayBuffer: async () => buffer.buffer.slice(
              buffer.byteOffset,
              buffer.byteOffset + buffer.byteLength
            )
          };
        }
        
        throw new Error(`Unsupported file type: ${url}`);
      };
      
      // Create IOHandler with custom fetch
      const ioHandler = this.tf.io.http(`file://${path.resolve(modelPath)}`, {
        fetchFunc: customFetch
      });
      
      // Load the model
      const model = await this.tf.loadLayersModel(ioHandler);
      
      console.log('✅ Model loaded successfully');
      console.log(`📊 Input shape: ${JSON.stringify(model.inputs[0].shape)}`);
      console.log(`🎢 Output shape: ${JSON.stringify(model.outputs[0].shape)}`);
      console.log(`🔢 Total parameters: ${model.countParams()}`);
      
      // Print model summary
      model.summary();
      
      return model;
      
    } catch (error) {
      console.error(`❌ Failed to load model: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a tensor from image buffer
   * @param {Buffer} imageBuffer - Image buffer
   * @param {number} targetSize - Target size for resizing (default: 224)
   * @returns {Promise<tf.Tensor>} - Image tensor
   */
  async createTensorFromImageBuffer(imageBuffer, targetSize = 224) {
    if (!this.isLoaded) {
      await this.initialize();
    }

    const sharp = require('sharp');
    
    try {
      // Resize image to target size and convert to RGB
      const imageArray = await sharp(imageBuffer)
        .resize(targetSize, targetSize, {
          fit: 'cover',
          position: 'center'
        })
        .removeAlpha() // Ensure RGB (no alpha channel)
        .raw()
        .toBuffer();
      
      console.log(`🖼️ Image resized to ${targetSize}x${targetSize}, buffer size: ${imageArray.length}`);
      
      // Convert Buffer to regular Array and normalize [0, 1]
      const normalizedPixels = [];
      
      for (let i = 0; i < imageArray.length; i++) {
        normalizedPixels[i] = imageArray[i] / 255.0;
      }
      
      
      // Create tensor as 3D then add batch dimension
      const img3d = this.tf.tensor3d(
        normalizedPixels,
        [targetSize, targetSize, 3],
        'float32'
      );
      const tensor = img3d.expandDims(0);
      img3d.dispose(); // Clean up intermediate tensor
      
      console.log(`✨ Created tensor with shape: ${JSON.stringify(tensor.shape)}`);
      return tensor;
      
    } catch (error) {
      console.error(`❌ Error creating tensor from image: ${error.message}`);
      throw new Error(`Image tensor creation failed: ${error.message}`);
    }
  }

  /**
   * Get system information
   */
  getSystemInfo() {
    if (!this.isLoaded) {
      return { status: 'not_loaded' };
    }

    let availableBackends = [];
    try {
      const registry = this.tf.engine().registry;
      if (registry && registry.backends) {
        availableBackends = Object.keys(registry.backends);
      }
    } catch (error) {
      console.warn('Could not get available backends:', error.message);
    }

    return {
      status: 'loaded',
      version: this.tf.version,
      backend: this.tf.getBackend(),
      memory: this.tf.memory(),
      platform: process.platform,
      nodeVersion: process.version,
      availableBackends
    };
  }

  /**
   * Dispose of tensors and clean up memory
   */
  dispose() {
    if (this.tf) {
      this.tf.disposeVariables();
    }
  }
}

// Export singleton instance
const tfLoader = new TensorFlowLoader();

// Initialize on module load
tfLoader.initialize().catch(error => {
  console.error('❌ Failed to auto-initialize TensorFlow.js:', error.message);
});

module.exports = tfLoader;
