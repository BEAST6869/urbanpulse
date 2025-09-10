"""
Create Demo Model Script

Creates a simple working model with correct architecture for demonstration
purposes. This model will have random weights but proper structure.
"""

import tensorflow as tf
import numpy as np
import json
import os

def create_demo_model():
    """Create a demo model with correct architecture"""
    
    # Load configuration
    config_path = '../model/labels.json'
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    num_classes = len(config['aiCategories'])
    print(f"Creating model for {num_classes} classes: {config['aiCategories']}")
    
    # Create model with correct architecture
    model = tf.keras.Sequential([
        tf.keras.layers.InputLayer(input_shape=(224, 224, 3)),
        
        # Feature extraction layers
        tf.keras.layers.Conv2D(32, 3, activation='relu'),
        tf.keras.layers.MaxPooling2D(2),
        tf.keras.layers.Conv2D(64, 3, activation='relu'),
        tf.keras.layers.MaxPooling2D(2),
        tf.keras.layers.Conv2D(128, 3, activation='relu'),
        tf.keras.layers.GlobalAveragePooling2D(),
        
        # Classification head
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dropout(0.5),
        tf.keras.layers.Dense(num_classes, activation='softmax', name='predictions')
    ])
    
    # Compile model
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    print("Model Architecture:")
    model.summary()
    
    return model

def create_synthetic_data(num_classes, samples_per_class=10):
    """Create some synthetic training data for the demo model"""
    
    # Generate random images and labels
    total_samples = num_classes * samples_per_class
    X = np.random.rand(total_samples, 224, 224, 3).astype(np.float32)
    
    # Create one-hot encoded labels
    y = np.zeros((total_samples, num_classes))
    for i in range(total_samples):
        class_idx = i % num_classes
        y[i, class_idx] = 1
    
    return X, y

def main():
    """Main function to create and save the demo model"""
    
    print("Creating UrbanPulse Demo AI Model")
    print("=" * 40)
    
    # Create model
    model = create_demo_model()
    
    # Load config to get number of classes
    with open('../model/labels.json', 'r') as f:
        config = json.load(f)
    num_classes = len(config['aiCategories'])
    
    # Generate some synthetic training data and train briefly
    print("Generating synthetic training data...")
    X_train, y_train = create_synthetic_data(num_classes, samples_per_class=20)
    X_val, y_val = create_synthetic_data(num_classes, samples_per_class=5)
    
    print("Training demo model briefly...")
    model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=3,
        batch_size=8,
        verbose=1
    )
    
    # Save the model
    model_dir = '../model'
    h5_path = os.path.join(model_dir, 'demo_model.h5')
    
    print(f"Saving model to {h5_path}")
    model.save(h5_path)
    
    print("Demo model created successfully!")
    print(f"Model saved to: {h5_path}")
    print("\nNext steps:")
    print("1. Run convert.py to convert to TensorFlow.js format")
    print("2. Test the integration with the backend")
    
    return True

if __name__ == "__main__":
    main()
