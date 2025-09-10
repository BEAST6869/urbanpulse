"""
Model Conversion Script

Converts trained Keras/TensorFlow models to TensorFlow.js format
for use in the web backend.
"""

import tensorflowjs as tfjs
import tensorflow as tf
import os
import argparse

def convert_model(input_path, output_path, quantization=None):
    """
    Convert a Keras model to TensorFlow.js format
    
    Args:
        input_path (str): Path to the input model (.h5 or SavedModel)
        output_path (str): Directory to save the converted model
        quantization (str): Quantization type ('uint8' or 'uint16')
    """
    
    print(f"Loading model from: {input_path}")
    
    # Load the model
    if input_path.endswith('.h5'):
        model = tf.keras.models.load_model(input_path)
    else:
        model = tf.saved_model.load(input_path)
    
    print("Model loaded successfully!")
    print(f"Model summary:")
    if hasattr(model, 'summary'):
        model.summary()
    
    # Create output directory if it doesn't exist
    os.makedirs(output_path, exist_ok=True)
    
    # Set conversion parameters
    conversion_params = {}
    
    if quantization == 'uint8':
        conversion_params['quantization_bytes'] = 1
        print("Using uint8 quantization (smaller size, slight accuracy loss)")
    elif quantization == 'uint16':
        conversion_params['quantization_bytes'] = 2
        print("Using uint16 quantization (balanced size/accuracy)")
    else:
        print("No quantization (full precision)")
    
    # Convert the model
    print(f"Converting model to TensorFlow.js format...")
    print(f"Output directory: {output_path}")
    
    tfjs.converters.save_keras_model(
        model, 
        output_path,
        **conversion_params
    )
    
    print("Conversion completed!")
    print(f"Generated files:")
    for file in os.listdir(output_path):
        file_path = os.path.join(output_path, file)
        size = os.path.getsize(file_path) / (1024 * 1024)  # Size in MB
        print(f"  - {file} ({size:.2f} MB)")
    
    return True

def validate_converted_model(model_path):
    """
    Validate that the converted model can be loaded
    
    Args:
        model_path (str): Path to the converted model directory
    """
    
    model_json_path = os.path.join(model_path, 'model.json')
    
    if not os.path.exists(model_json_path):
        print(f"Error: model.json not found in {model_path}")
        return False
    
    print("Validation:")
    print(f"✓ model.json exists")
    
    # Check for weight files
    bin_files = [f for f in os.listdir(model_path) if f.endswith('.bin')]
    if bin_files:
        print(f"✓ Found weight files: {', '.join(bin_files)}")
    else:
        print("⚠ No .bin weight files found")
    
    # Try to read the model.json
    try:
        import json
        with open(model_json_path, 'r') as f:
            model_config = json.load(f)
        print(f"✓ model.json is valid JSON")
        print(f"✓ Model format: {model_config.get('format', 'unknown')}")
        print(f"✓ Model name: {model_config.get('modelTopology', {}).get('model_config', {}).get('config', {}).get('name', 'unknown')}")
    except Exception as e:
        print(f"⚠ Error reading model.json: {e}")
    
    return True

def main():
    parser = argparse.ArgumentParser(description='Convert Keras model to TensorFlow.js')
    parser.add_argument(
        '--input', 
        default='../model/best_model.h5',
        help='Input model path (.h5 or SavedModel directory)'
    )
    parser.add_argument(
        '--output', 
        default='../model/',
        help='Output directory for converted model'
    )
    parser.add_argument(
        '--quantization',
        choices=['uint8', 'uint16'],
        help='Quantization type for smaller model size'
    )
    parser.add_argument(
        '--validate',
        action='store_true',
        help='Validate converted model after conversion'
    )
    
    args = parser.parse_args()
    
    print("TensorFlow.js Model Conversion Tool")
    print("=" * 40)
    
    # Check if input model exists
    if not os.path.exists(args.input):
        print(f"Error: Input model not found: {args.input}")
        print("Please train a model first using train.py")
        return
    
    # Convert the model
    try:
        success = convert_model(args.input, args.output, args.quantization)
        
        if success and args.validate:
            print("\n" + "=" * 40)
            validate_converted_model(args.output)
            
        print("\n" + "=" * 40)
        print("Conversion completed successfully!")
        print("Next steps:")
        print("1. Start the backend server")
        print("2. Test the model using the /classify endpoint")
        print("3. Check the /health endpoint for model status")
        
    except Exception as e:
        print(f"Error during conversion: {e}")
        print("Make sure you have tensorflowjs installed:")
        print("pip install tensorflowjs")

if __name__ == "__main__":
    main()
