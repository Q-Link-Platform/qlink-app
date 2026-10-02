const fs = require('fs');
const sharp = require('sharp');

async function createZoomedLogo() {
  try {
    console.log('🔍 Creating zoomed-in logo versions...');
    
    // Read your high-quality image
    const inputBuffer = fs.readFileSync('public/logo-high-quality.png');
    
    // Get image info
    const metadata = await sharp(inputBuffer).metadata();
    console.log(`📏 Original image: ${metadata.width}x${metadata.height}`);
    
    // Create zoomed versions - focus on center part
    
    // 1. Session Key version (32x32) - Zoomed 1.5x on center
    const sessionKeyLogo = await sharp(inputBuffer)
      .extract({
        left: Math.floor(metadata.width * 0.25),  // Start at 25% from left
        top: Math.floor(metadata.height * 0.25),   // Start at 25% from top
        width: Math.floor(metadata.width * 0.5),   // Extract 50% width
        height: Math.floor(metadata.height * 0.5)  // Extract 50% height
      })
      .resize(32, 32, { 
        fit: 'cover', // Use cover to fill the space
        background: { r: 15, g: 23, b: 42, alpha: 1 },
        position: 'center',
        kernel: sharp.kernel.lanczos3
      })
      .sharpen({ sigma: 0.5, flat: 1.5, jagged: 2 })
      .modulate({ brightness: 1.02, saturation: 1.1 })
      .png({ quality: 100, compressionLevel: 6 })
      .toBuffer();
    
    // 2. Welcome Screen version (64x64) - Zoomed 1.3x on center
    const welcomeLogo = await sharp(inputBuffer)
      .extract({
        left: Math.floor(metadata.width * 0.2),   // Start at 20% from left
        top: Math.floor(metadata.height * 0.2),    // Start at 20% from top
        width: Math.floor(metadata.width * 0.6),   // Extract 60% width
        height: Math.floor(metadata.height * 0.6)   // Extract 60% height
      })
      .resize(64, 64, { 
        fit: 'cover',
        background: { r: 15, g: 23, b: 42, alpha: 1 },
        position: 'center',
        kernel: sharp.kernel.lanczos3
      })
      .sharpen({ sigma: 0.3, flat: 1, jagged: 1 })
      .modulate({ brightness: 1.01, saturation: 1.05 })
      .png({ quality: 100, compressionLevel: 6 })
      .toBuffer();
    
    // 3. More zoomed version for Session Key (2x zoom)
    const sessionKeyZoomed2x = await sharp(inputBuffer)
      .extract({
        left: Math.floor(metadata.width * 0.3),   // Start at 30% from left
        top: Math.floor(metadata.height * 0.3),    // Start at 30% from top
        width: Math.floor(metadata.width * 0.4),   // Extract 40% width
        height: Math.floor(metadata.height * 0.4)   // Extract 40% height
      })
      .resize(32, 32, { 
        fit: 'cover',
        background: { r: 15, g: 23, b: 42, alpha: 1 },
        position: 'center',
        kernel: sharp.kernel.lanczos3
      })
      .sharpen({ sigma: 0.6, flat: 1.8, jagged: 2.5 })
      .modulate({ brightness: 1.03, saturation: 1.15 })
      .png({ quality: 100, compressionLevel: 6 })
      .toBuffer();
    
    // Save zoomed versions
    fs.writeFileSync('public/logo-session-key-zoomed.png', sessionKeyLogo);
    fs.writeFileSync('public/logo-welcome-zoomed.png', welcomeLogo);
    fs.writeFileSync('public/logo-session-key-2x-zoom.png', sessionKeyZoomed2x);
    
    console.log('✅ Zoomed logo versions created:');
    console.log(`   logo-session-key-zoomed.png (32x32, 1.5x zoom) - ${sessionKeyLogo.length} bytes`);
    console.log(`   logo-welcome-zoomed.png (64x64, 1.3x zoom) - ${welcomeLogo.length} bytes`);
    console.log(`   logo-session-key-2x-zoom.png (32x32, 2x zoom) - ${sessionKeyZoomed2x.length} bytes`);
    
    console.log('\n🔍 Zoomed logos ready!');
    console.log('📱 Focused on central part of image!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createZoomedLogo();
