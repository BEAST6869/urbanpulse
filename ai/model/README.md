# Model Files

This directory contains the TensorFlow.js model files for urban infrastructure classification.

## Current Files

- `model.json` - Model architecture and metadata (placeholder)
- `model.bin` - Model weights (placeholder - needs actual trained weights)

## Status

⚠️ **PLACEHOLDER FILES** - These are template files for reference only.

To use the classification system, you need to:

1. Train a model using the scripts in `../scripts/`
2. Convert your trained model to TensorFlow.js format
3. Replace these placeholder files with your actual model files

## Expected Model Specifications

- **Input**: 224x224x3 RGB images
- **Output**: 2 classes (pothole, garbage)
- **Format**: TensorFlow.js layers model
- **Backend**: CPU optimized

## File Requirements

- `model.json`: Must contain valid TensorFlow.js model architecture
- `model.bin`: Must contain actual trained weights (binary format)

## Testing

Once you have real model files, test them by:

1. Starting the backend server
2. Check `/health` endpoint for model loading status
3. Use `/classify` endpoint with test images
