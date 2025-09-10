const sharp = require('sharp');
const fs = require('fs');

async function createTestPotholeImage() {
  try {
    console.log('🎨 Creating test pothole-like image...');
    
    // Create a pothole-like image: dark center (pothole) with lighter edges (asphalt)
    // This simulates the visual characteristics of a pothole
    const width = 400;
    const height = 300;
    
    // Create image buffer with pothole-like pattern
    const imageBuffer = Buffer.alloc(width * height * 3);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 3;
        
        // Calculate distance from center
        const centerX = width / 2;
        const centerY = height / 2;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
        const normalizedDistance = distance / maxDistance;
        
        // Create pothole effect: darker in center, lighter at edges
        // Add some randomness for realistic texture
        const noise = (Math.random() - 0.5) * 30;
        const baseGray = 60 + (normalizedDistance * 80) + noise; // Dark center to lighter edges
        
        // Make it look more like asphalt/concrete
        const gray = Math.max(20, Math.min(150, baseGray));
        
        // RGB values (grayish with slight variations)
        imageBuffer[index] = gray + (Math.random() - 0.5) * 20;     // R
        imageBuffer[index + 1] = gray + (Math.random() - 0.5) * 15; // G  
        imageBuffer[index + 2] = gray + (Math.random() - 0.5) * 10; // B
      }
    }
    
    // Convert to JPEG
    const jpegBuffer = await sharp(imageBuffer, {
      raw: {
        width: width,
        height: height,
        channels: 3
      }
    })
    .jpeg({ quality: 85 })
    .toBuffer();
    
    // Save the image
    fs.writeFileSync('pothole-test.jpg', jpegBuffer);
    console.log('✅ Test pothole image created as pothole-test.jpg');
    console.log(`📊 Image size: ${jpegBuffer.length} bytes`);
    
  } catch (error) {
    console.error('❌ Error creating test image:', error.message);
  }
}

createTestPotholeImage();
