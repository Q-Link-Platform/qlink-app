const fs = require('fs');
const sharp = require('sharp');

async function createLessZoomedLogo() {
  try {
    console.log('🔍 Creating slightly less zoomed logo versions...');
    
    // Read your high-quality image
    const inputBuffer = fs.readFileSync('public/logo-high-quality.png');
    
    // Get image info
    const metadata = await sharp(inputBuffer).metadata();
    console.log(`📏 Original image: ${metadata.width}x${metadata.height}`);
    
    // Create less zoomed versions - more balanced view
    
    // 1. Session Key version (32x32) - Zoomed 1.3x on center (less than 2x)
    const sessionKeyLogo = await sharp(inputBuffer)
      .extract({
        left: Math.floor(metadata.width * 0.2),   // Start at 20% from left
        top: Math.floor(metadata.height * 0.2),    // Start at 20% from top
        width: Math.floor(metadata.width * 0.6),   // Extract 60% width
        height: Math.floor(metadata.height * 0.6)   // Extract 60% height
      })
      .resize(32, 32, { 
        fit: 'cover',
        background: { r: 15, g: 23, b: 42, alpha: 1 },
        position: 'center',
        kernel: sharp.kernel.lanczos3
      })
      .sharpen({ sigma: 0.4, flat: 1.2, jagged: 1.5 })
      .modulate({ brightness: 1.02, saturation: 1.08 })
      .png({ quality: 100, compressionLevel: 6 })
      .toBuffer();
    
    // 2. Welcome Screen version (64x64) - Zoomed 1.15x on center (less than 1.3x)
    const welcomeLogo = await sharp(inputBuffer)
      .extract({
        left: Math.floor(metadata.width * 0.15),  // Start at 15% from left
        top: Math.floor(metadata.height * 0.15),    // Start at 15% from top
        width: Math.floor(metadata.width * 0.7),   // Extract 70% width
        height: Math.floor(metadata.height * 0.7)   // Extract 70% height
      })
      .resize(64, 64, { 
        fit: 'cover',
        background: { r: 15, g: 23, b: 42, alpha: 1 },
        position: 'center',
        kernel: sharp.kernel.lanczos3
      })
      .sharpen({ sigma: 0.25, flat: 0.8, jagged: 1 })
      .modulate({ brightness: 1.01, saturation: 1.03 })
      .png({ quality: 100, compressionLevel: 6 })
      .toBuffer();
    
    // 3. Even less zoomed version for Session Key (1.2x zoom)
    const sessionKeyLessZoomed = await sharp(inputBuffer)
      .extract({
        left: Math.floor(metadata.width * 0.15),  // Start at 15% from left
        top: Math.floor(metadata.height * 0.15),    // Start at 15% from top
        width: Math.floor(metadata.width * 0.7),   // Extract 70% width
        height: Math.floor(metadata.height * 0.7)   // Extract 70% height
      })
      .resize(32, 32, { 
        fit: 'cover',
        background: { r: 15, g: 23, b: 42, alpha: 1 },
        position: 'center',
        kernel: sharp.kernel.lanczos3
      })
      .sharpen({ sigma: 0.3, flat: 1, jagged: 1.2 })
      .modulate({ brightness: 1.01, saturation: 1.05 })
      .png({ quality: 100, compressionLevel: 6 })
      .toBuffer();
    
    // Save less zoomed versions
    fs.writeFileSync('public/logo-session-key-less-zoom.png', sessionKeyLogo);
    fs.writeFileSync('public/logo-welcome-less-zoom.png', welcomeLogo);
    fs.writeFileSync('public/logo-session-key-minimal-zoom.png', sessionKeyLessZoomed);
    
    console.log('✅ Less zoomed logo versions created:');
    console.log(`   logo-session-key-less-zoom.png (32x32, 1.3x zoom) - ${sessionKeyLogo.length} bytes`);
    console.log(`   logo-welcome-less-zoom.png (64x64, 1.15x zoom) - ${welcomeLogo.length} bytes`);
    console.log(`   logo-session-key-minimal-zoom.png (32x32, 1.2x zoom) - ${sessionKeyLessZoomed.length} bytes`);
    
    console.log('\n🔍 Less zoomed logos ready!');
    console.log('📱 More balanced view with slight zoom!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createLessZoomedLogo();
