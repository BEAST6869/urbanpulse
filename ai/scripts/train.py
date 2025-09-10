"""
Urban Infrastructure Image Classification Training Script

This script trains a CNN model to classify images of urban infrastructure
into two categories: potholes and garbage.
"""

import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import os
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt

# Configuration
IMG_HEIGHT = 224
IMG_WIDTH = 224
BATCH_SIZE = 32
EPOCHS = 50

# Load categories from labels.json
import json
with open('../model/labels.json', 'r') as f:
    labels_config = json.load(f)
    
CLASS_NAMES = labels_config['aiCategories']
NUM_CLASSES = len(CLASS_NAMES)

print(f"Loaded {NUM_CLASSES} categories: {CLASS_NAMES}")

# Data paths
DATA_DIR = '../data'
TRAINING_DIR = os.path.join(DATA_DIR, 'training')
VALIDATION_DIR = os.path.join(DATA_DIR, 'validation')

def create_data_generators():
    """Create data generators with augmentation for training"""
    
    # Training data generator with augmentation
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest'
    )
    
    # Validation data generator (only rescaling)
    validation_datagen = ImageDataGenerator(rescale=1./255)
    
    # Create generators
    train_generator = train_datagen.flow_from_directory(
        TRAINING_DIR,
        target_size=(IMG_HEIGHT, IMG_WIDTH),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        classes=CLASS_NAMES
    )
    
    validation_generator = validation_datagen.flow_from_directory(
        VALIDATION_DIR,
        target_size=(IMG_HEIGHT, IMG_WIDTH),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        classes=CLASS_NAMES
    )
    
    return train_generator, validation_generator

def create_model():
    """Create CNN model for binary classification"""
    
    model = models.Sequential([
        # Base CNN layers
        layers.Conv2D(32, (3, 3), activation='relu', input_shape=(IMG_HEIGHT, IMG_WIDTH, 3)),
        layers.MaxPooling2D(2, 2),
        
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D(2, 2),
        
        layers.Conv2D(128, (3, 3), activation='relu'),
        layers.MaxPooling2D(2, 2),
        
        layers.Conv2D(128, (3, 3), activation='relu'),
        layers.MaxPooling2D(2, 2),
        
        # Classifier layers
        layers.Flatten(),
        layers.Dropout(0.5),
        layers.Dense(512, activation='relu'),
        layers.Dense(NUM_CLASSES, activation='softmax')
    ])
    
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def plot_training_history(history):
    """Plot training and validation accuracy/loss"""
    
    acc = history.history['accuracy']
    val_acc = history.history['val_accuracy']
    loss = history.history['loss']
    val_loss = history.history['val_loss']
    
    epochs_range = range(len(acc))
    
    plt.figure(figsize=(12, 4))
    
    plt.subplot(1, 2, 1)
    plt.plot(epochs_range, acc, label='Training Accuracy')
    plt.plot(epochs_range, val_acc, label='Validation Accuracy')
    plt.legend(loc='lower right')
    plt.title('Training and Validation Accuracy')
    
    plt.subplot(1, 2, 2)
    plt.plot(epochs_range, loss, label='Training Loss')
    plt.plot(epochs_range, val_loss, label='Validation Loss')
    plt.legend(loc='upper right')
    plt.title('Training and Validation Loss')
    
    plt.savefig('../model/training_history.png')
    plt.show()

def main():
    """Main training function"""
    
    print("Starting Urban Infrastructure Classification Training...")
    print(f"Image size: {IMG_HEIGHT}x{IMG_WIDTH}")
    print(f"Batch size: {BATCH_SIZE}")
    print(f"Epochs: {EPOCHS}")
    print(f"Classes: {CLASS_NAMES}")
    
    # Check if data directories exist
    if not os.path.exists(TRAINING_DIR):
        print(f"Error: Training directory not found: {TRAINING_DIR}")
        print("Please add training images to the data/training/ directory")
        return
    
    if not os.path.exists(VALIDATION_DIR):
        print(f"Error: Validation directory not found: {VALIDATION_DIR}")
        print("Please add validation images to the data/validation/ directory")
        return
    
    # Create data generators
    print("Creating data generators...")
    train_generator, validation_generator = create_data_generators()
    
    print(f"Training samples: {train_generator.samples}")
    print(f"Validation samples: {validation_generator.samples}")
    
    # Create model
    print("Creating model...")
    model = create_model()
    model.summary()
    
    # Setup callbacks
    callbacks = [
        tf.keras.callbacks.ModelCheckpoint(
            '../model/best_model.h5',
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor='val_accuracy',
            patience=10,
            restore_best_weights=True
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.2,
            patience=5,
            min_lr=1e-7
        )
    ]
    
    # Train model
    print("Starting training...")
    history = model.fit(
        train_generator,
        epochs=EPOCHS,
        validation_data=validation_generator,
        callbacks=callbacks
    )
    
    # Plot training history
    plot_training_history(history)
    
    # Save final model
    model.save('../model/final_model.h5')
    print("Model saved as final_model.h5")
    
    # Evaluate model
    print("Evaluating model...")
    val_loss, val_accuracy = model.evaluate(validation_generator)
    print(f"Final validation accuracy: {val_accuracy:.4f}")
    print(f"Final validation loss: {val_loss:.4f}")
    
    print("Training completed!")
    print("Next steps:")
    print("1. Convert the model to TensorFlow.js format using convert.py")
    print("2. Place the converted files in the model/ directory")
    print("3. Test the model with the backend server")

if __name__ == "__main__":
    main()
