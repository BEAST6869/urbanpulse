"""
Download Sample Images Script

This script downloads sample images from the internet for each category 
to populate the training folders. Uses free image sources.
"""

import os
import requests
import json
from urllib.parse import urlparse
import time

# Load categories from labels.json
with open('../model/labels.json', 'r') as f:
    labels_config = json.load(f)

categories = labels_config['aiCategories']

# Sample image URLs for each category (using free image sources)
# Note: In production, you should use proper datasets or collect your own images
sample_urls = {
    'pothole': [
        'https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=500',  # Road damage
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',    # Street repair
        'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=500',  # Road construction
    ],
    'garbage': [
        'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500',  # Litter
        'https://images.unsplash.com/photo-1484731262792-5654e906b245?w=500',  # Trash
        'https://images.unsplash.com/photo-1540479859555-17af45c78602?w=500',  # Waste
    ],
    'streetlight': [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',  # Street lamp
        'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=500',  # Night lighting
        'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500',  # Urban lighting
    ],
    'road_damage': [
        'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=500',  # Cracked road
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',    # Road wear
        'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=500',  # Damaged street
    ],
    'vandalism': [
        'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=500',  # Graffiti
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500',  # Street art
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500',  # Wall damage
    ],
    'construction': [
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500',  # Construction site
        'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=500',  # Road work
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',    # Construction
    ],
    'water_leak': [
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500',    # Water on street
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',  # Flood
        'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=500',    # Water damage
    ],
    'traffic_sign': [
        'https://images.unsplash.com/photo-1544264092-1e2b24c47b30?w=500',    # Traffic signs
        'https://images.unsplash.com/photo-1533557429444-11cca25b2589?w=500',  # Road signs  
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',  # Street signs
    ],
    'sidewalk_damage': [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',    # Sidewalk repair
        'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=500',  # Pavement damage
        'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=500',  # Concrete cracks
    ],
    'other': [
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500',  # Urban scene
        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=500',  # City street
        'https://images.unsplash.com/photo-1486718448742-163732cd1544?w=500',  # Urban environment
    ]
}

def download_image(url, filepath):
    """Download an image from URL to filepath"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=30, stream=True)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        print(f"✅ Downloaded: {os.path.basename(filepath)}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to download {url}: {str(e)}")
        return False

def download_samples_for_category(category, urls, training_folder, validation_folder):
    """Download sample images for a specific category"""
    print(f"\n📁 Processing category: {category}")
    
    downloaded = 0
    
    for i, url in enumerate(urls):
        # Split between training (80%) and validation (20%)
        if i < len(urls) * 0.8:
            folder = training_folder
            split = "training"
        else:
            folder = validation_folder
            split = "validation"
        
        # Create filename
        filename = f"{category}_{i+1}.jpg"
        filepath = os.path.join(folder, filename)
        
        # Skip if file already exists
        if os.path.exists(filepath):
            print(f"⏭️ Skipped (exists): {filename}")
            continue
        
        # Download image
        if download_image(url, filepath):
            downloaded += 1
            
        # Be nice to servers
        time.sleep(1)
    
    print(f"📊 Downloaded {downloaded} new images for {category}")
    return downloaded

def main():
    print("🎯 Sample Image Downloader for UrbanPulse AI Training")
    print("=" * 60)
    
    base_dir = os.path.join('..', 'data')
    training_base = os.path.join(base_dir, 'training')
    validation_base = os.path.join(base_dir, 'validation')
    
    total_downloaded = 0
    
    for category in categories:
        if category not in sample_urls:
            print(f"⚠️ No sample URLs defined for category: {category}")
            continue
        
        training_folder = os.path.join(training_base, category)
        validation_folder = os.path.join(validation_base, category)
        
        # Ensure folders exist
        os.makedirs(training_folder, exist_ok=True)
        os.makedirs(validation_folder, exist_ok=True)
        
        # Download samples
        downloaded = download_samples_for_category(
            category, 
            sample_urls[category], 
            training_folder, 
            validation_folder
        )
        
        total_downloaded += downloaded
    
    print("\n" + "=" * 60)
    print(f"🎉 Download completed! Total new images: {total_downloaded}")
    print("\n📋 Summary:")
    
    # Count existing images
    for category in categories:
        training_folder = os.path.join(training_base, category)
        validation_folder = os.path.join(validation_base, category)
        
        training_count = len([f for f in os.listdir(training_folder) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]) if os.path.exists(training_folder) else 0
        validation_count = len([f for f in os.listdir(validation_folder) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]) if os.path.exists(validation_folder) else 0
        
        print(f"   {category:<15}: {training_count:>3} training, {validation_count:>2} validation")
    
    print("\n💡 Next steps:")
    print("1. Review downloaded images and remove any inappropriate ones")
    print("2. Add more images from your own sources for better accuracy") 
    print("3. Run training: python ai/scripts/train.py")
    print("4. Convert model: python ai/scripts/convert.py")
    
    print("\n⚠️ Note: These are sample images from free sources.")
    print("For production use, collect real urban issue images specific to your area.")

if __name__ == "__main__":
    main()
